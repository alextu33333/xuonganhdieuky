import { GoogleGenAI } from "@google/genai";
import type { Handler } from "@netlify/functions";

interface RequestBody {
    basePrompt: string;
}

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { basePrompt } = JSON.parse(event.body || '{}') as RequestBody;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const fullPrompt = `Based on the user's idea for a child's portrait, enhance it into a detailed, creative, and vivid prompt suitable for an AI image generator. The user's idea is: "${basePrompt}". The final prompt should be a single paragraph, written in English for best results with the image model.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    const enhancedPrompt = response.text;
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: enhancedPrompt }),
    };
  } catch (error: any) {
    console.error('Error in generate-prompt function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export { handler };