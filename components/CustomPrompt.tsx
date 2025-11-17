import React from 'react';
import { SparklesIcon } from './icons';

interface CustomPromptProps {
  customText: string;
  onTextChange: (text: string) => void;
  onGeneratePrompt: () => void;
  generatedPrompt: string | null;
  isGenerating: boolean;
  disabled?: boolean;
}

export const CustomPrompt: React.FC<CustomPromptProps> = ({
  customText,
  onTextChange,
  onGeneratePrompt,
  generatedPrompt,
  isGenerating,
  disabled = false,
}) => {
  return (
    <div className="space-y-4">
      <textarea
        value={customText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="VD: Bé gái mặc váy công chúa bay trên lưng rồng trên bầu trời đầy sao..."
        className={`w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-800' : ''}`}
        disabled={disabled}
      />
      <button
        onClick={onGeneratePrompt}
        disabled={!customText.trim() || isGenerating || disabled}
        className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <SparklesIcon className="h-5 w-5" />
        {isGenerating ? 'Đang xử lý...' : 'Tạo Prompt Chuẩn'}
      </button>
      {generatedPrompt && (
        <div className="mt-4 p-3 bg-gray-900/50 border border-gray-600 rounded-lg">
           <h4 className="text-sm font-semibold text-amber-300 mb-2">Prompt đã tạo:</h4>
           <p className="text-sm text-gray-300 italic">{generatedPrompt}</p>
        </div>
      )}
    </div>
  );
};
