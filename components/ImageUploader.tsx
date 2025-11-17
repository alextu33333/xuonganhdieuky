import React, { useRef } from 'react';
import { UploadIcon, CloseIcon } from './icons';

interface ImageUploaderProps {
  onImageUpload: (file: File, base64: string) => void;
  preview: string | null;
  label: string;
  description: string;
  isMainUploader?: boolean;
  onImageRemove?: () => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, preview, label, description, isMainUploader = false, onImageRemove }) => {
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Invalid file type. Please upload a JPG, PNG, or WEBP.');
        return;
      }
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError('File is too large. Please upload an image under 4MB.');
        return;
      }
      
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onImageUpload(file, base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  const containerHeight = isMainUploader ? 'h-48' : 'h-32';

  return (
    <div className="w-full">
      <h2 className={`text-lg font-semibold text-amber-300 mb-2 ${isMainUploader ? '' : 'text-base'}`}>{label}</h2>
      {description && <p className="text-sm text-gray-400 mb-4">{description}</p>}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      <div className="relative">
        <div
          className={`w-full ${containerHeight} border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:border-amber-400 hover:text-amber-400 transition-colors cursor-pointer bg-gray-800/50`}
          onClick={handleContainerClick}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-md" />
          ) : (
            <div className="text-center">
              <UploadIcon className="h-10 w-10 mx-auto" />
              <p className="text-sm">Click to upload</p>
               {!isMainUploader && <p className="text-xs">Optional</p>}
            </div>
          )}
        </div>
        {preview && onImageRemove && (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onImageRemove();
                }}
                className="absolute top-1.5 right-1.5 z-10 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-all transform hover:scale-110"
                aria-label="Remove image"
            >
                <CloseIcon className="h-4 w-4" />
            </button>
        )}
      </div>
       {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};