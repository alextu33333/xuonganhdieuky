import type { UploadedPerson } from '../types';

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

export const generateImage = async (params: GenerateImageParams): Promise<string[]> => {
    const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image.');
    }

    return data.images;
};

export const generateEnhancedPrompt = async (basePrompt: string): Promise<string> => {
    const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ basePrompt }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt.');
    }

    return data.prompt;
};