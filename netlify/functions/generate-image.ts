import { GoogleGenAI, Modality } from "@google/genai";
import type { Handler } from "@netlify/functions";

// Types mirrored from frontend for use in the serverless function
type UploadedPerson = {
  file: { type: string };
  base64: string;
};

interface RequestBody {
    person: UploadedPerson;
    friends: UploadedPerson[];
    product?: UploadedPerson | null;
    scenePrompt: string;
    costumePrompt: string;
    stylePrompt: string;
    resolutionPrompt: string;
    isFullBody: boolean;
    anglePrompt: string;
    effectPrompt: string;
    numImages: number;
}

const constructPrompt = (params: Omit<RequestBody, 'person' | 'numImages' | 'friends' | 'product'> & { friendCount: number, hasProduct: boolean }): string => {
    // Start with the main instruction: re-imagine the person.
    let finalPrompt = `Recreate the person from the provided first photo as a new piece of art.`;
    
    // Add style
    finalPrompt += ` The artistic style is: ${params.stylePrompt}.`;

    // Add costume
    if (params.costumePrompt) {
        finalPrompt += ` Dress them in: ${params.costumePrompt}.`;
    }

    // Add scene
    if (params.scenePrompt) {
        finalPrompt += ` Place them in this setting: ${params.scenePrompt}.`;
    }

    // Body shot type
    if (params.isFullBody) {
        finalPrompt += ` The portrait must be a full-body shot.`;
    } else {
        finalPrompt += ` The portrait should be from the chest up.`;
    }
    
    // Combine other artistic details
    const artisticDirections = [
        params.resolutionPrompt,
        params.anglePrompt,
        params.effectPrompt
    ].filter(Boolean).join('. ');

    if (artisticDirections) {
        finalPrompt += ` Additional artistic details: ${artisticDirections}.`;
    }

    if (params.friendCount > 0) {
        const friendText = params.friendCount === 1 ? 'the other person' : `the other ${params.friendCount} people`;
        finalPrompt += ` The main person should appear alongside ${friendText} from the other provided photos. Faithfully recreate every individual, maintaining their distinct facial features and apparent ages from their respective photos. Position them all together naturally within the scene. Ensure their relative sizes and appearances are accurate (e.g., adults vs. children).`;
    }

    if (params.hasProduct) {
        finalPrompt += ` The main person (or one of the people) should be holding or interacting with the product from the final provided image. The product's scale must be realistic in relation to the person; do not make it disproportionately large or small.`;
    }

    finalPrompt += ` It is crucial to preserve the person's unique facial features and likeness from the original image. The final output should be a seamless, high-quality, and artistically cohesive portrait, not just a simple photoshop edit. Focus on creating a brand new, complete image.`;
    
    return finalPrompt;
};

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const params = JSON.parse(event.body || '{}') as RequestBody;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = constructPrompt({ ...params, friendCount: params.friends.length, hasProduct: !!params.product });
    
    const parts: any[] = [];
    parts.push({
      inlineData: {
        mimeType: params.person.file.type,
        data: params.person.base64,
      },
    });

    for (const friend of params.friends) {
        parts.push({
           inlineData: {
               mimeType: friend.file.type,
               data: friend.base64,
           },
        });
    }
    
    if (params.product) {
         parts.push({
            inlineData: {
                mimeType: params.product.file.type,
                data: params.product.base64,
            },
         });
    }
    parts.push({ text: prompt });

    const imagePromises: Promise<string>[] = Array.from({ length: params.numImages }).map(() =>
        (async () => {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: parts },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            const imagePart = response?.candidates?.[0]?.content?.parts?.find(
                (part) => part.inlineData && part.inlineData.mimeType.startsWith('image/')
            );

            if (imagePart?.inlineData?.data) {
                return imagePart.inlineData.data;
            }
            
            const finishReason = response?.candidates?.[0]?.finishReason;
            if (finishReason === 'SAFETY') {
                throw new Error('The request was blocked for safety reasons.');
            }
            
            console.error("Full Gemini Response:", JSON.stringify(response, null, 2));
            throw new Error(`No image found in Gemini response. Finish reason: ${finishReason || 'Unknown'}.`);
        })()
    );
    
    const base64Images = await Promise.all(imagePromises);
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: base64Images }),
    };
  } catch (error: any) {
    console.error('Error in generate-image function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export { handler };