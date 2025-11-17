import { GoogleGenAI, Modality } from "@google/genai";
import type { UploadedPerson } from '../types';

// Per guidelines, API key must be from process.env.
const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GenerateImageParams {
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

const constructPrompt = (params: Omit<GenerateImageParams, 'person' | 'numImages' | 'friends' | 'product'> & { friendCount: number, hasProduct: boolean }): string => {
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


export const generateImage = async (params: GenerateImageParams): Promise<string[]> => {
    const ai = getAi();
    const prompt = constructPrompt({ ...params, friendCount: params.friends.length, hasProduct: !!params.product });
    
    const parts: any[] = [];

    // Main person image is always first
    parts.push({
      inlineData: {
        mimeType: params.person.file.type,
        data: params.person.base64,
      },
    });

    // Add friend images if they exist
    for (const friend of params.friends) {
        parts.push({
           inlineData: {
               mimeType: friend.file.type,
               data: friend.base64,
           },
        });
    }
    
    // Add product image if it exists
    if (params.product) {
         parts.push({
            inlineData: {
                mimeType: params.product.file.type,
                data: params.product.base64,
            },
         });
    }

    // Add the text prompt at the end
    parts.push({ text: prompt });

    // The model generates one image at a time.
    // We need to call it `numImages` times in parallel.
    const imagePromises: Promise<string>[] = [];
    for (let i = 0; i < params.numImages; i++) {
        imagePromises.push(
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

                // Provide a more detailed error if no image is found
                const finishReason = response?.candidates?.[0]?.finishReason;
                if (finishReason === 'SAFETY') {
                    const safetyRatings = response?.candidates?.[0]?.safetyRatings;
                    console.error("Image generation blocked due to safety concerns:", safetyRatings);
                    throw new Error('The request was blocked for safety reasons. Please try a different prompt or image.');
                }
                
                console.error("Full Gemini Response:", JSON.stringify(response, null, 2));
                throw new Error(`No image found in Gemini response. Finish reason: ${finishReason || 'Unknown'}.`);
            })()
        );
    }
    
    const base64Images = await Promise.all(imagePromises);
    return base64Images;
};

export const generateEnhancedPrompt = async (basePrompt: string): Promise<string> => {
    const ai = getAi();
    const fullPrompt = `Based on the user's idea for a child's portrait, enhance it into a detailed, creative, and vivid prompt suitable for an AI image generator. The user's idea is: "${basePrompt}". The final prompt should be a single paragraph, written in English for best results with the image model.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    
    return response.text;
};