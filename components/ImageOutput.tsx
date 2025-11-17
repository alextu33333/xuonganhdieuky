
import React from 'react';
import { SparklesIcon, DownloadIcon } from './icons';

interface ImageOutputProps {
    isLoading: boolean;
    images: string[];
    error: string | null;
}

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <SparklesIcon className="h-16 w-16 text-amber-400 animate-pulse" />
        <h2 className="text-2xl font-bold mt-4">Creating Magic...</h2>
        <p className="mt-2 text-center">Our AI is painting a masterpiece for you. <br/> This can take a moment.</p>
    </div>
);

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-800/50 rounded-lg">
        <SparklesIcon className="h-20 w-20" />
        <h2 className="text-3xl font-bold mt-4">Your Portraits Will Appear Here</h2>
        <p className="mt-2">Complete the steps on the left to begin.</p>
    </div>
);

const ErrorState: React.FC<{ error: string }> = ({ error }) => (
     <div className="flex flex-col items-center justify-center h-full text-red-400 bg-red-900/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold">Oops! Something went wrong.</h2>
        <p className="mt-2 text-center">{error}</p>
    </div>
);

export const ImageOutput: React.FC<ImageOutputProps> = ({ isLoading, images, error }) => {
    
    const downloadImage = (base64Image: string, index: number) => {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${base64Image}`;
        link.download = `magic-portrait-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;
    if (images.length === 0) return <InitialState />;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {images.map((imgSrc, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border-2 border-gray-700">
                    <img src={`data:image/png;base64,${imgSrc}`} alt={`Generated Portrait ${index + 1}`} className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                        <button 
                          onClick={() => downloadImage(imgSrc, index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-amber-500 text-gray-900 font-bold py-2 px-4 rounded-full flex items-center gap-2"
                        >
                            <DownloadIcon className="h-5 w-5"/>
                            Download
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
