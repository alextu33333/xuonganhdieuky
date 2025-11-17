import React, { useState, useRef, useEffect } from 'react';
import type { SimpleOption } from '../types';
import { ChevronDownIcon } from './icons';

interface SimpleSelectorProps {
  title: string;
  items: SimpleOption[];
  selectedId: string | null;
  onSelectId: (id: string | null) => void;
}

export const SimpleSelector: React.FC<SimpleSelectorProps> = ({ title, items, selectedId, onSelectId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (id: string | null) => {
    onSelectId(id);
    setIsOpen(false);
  };

  const selectedItem = items.find(item => item.id === selectedId);
  const buttonText = selectedItem?.name ?? 'Không chọn';

  return (
    <div>
        <h3 className="text-md font-medium text-gray-200 mb-2">{title}</h3>
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-gray-700 rounded-md px-4 py-2 text-left flex items-center justify-between transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
                <span className="text-white truncate text-sm">{buttonText}</span>
                <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-20 mt-2 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                <div className="p-1 space-y-1">
                    <button
                        onClick={() => handleSelect(null)}
                        className="w-full text-left p-2 rounded-md transition-colors hover:bg-gray-700 text-sm text-gray-300 font-semibold"
                    >
                        Không chọn
                    </button>
                    {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleSelect(item.id)}
                        className={`w-full text-left p-2 rounded-md transition-colors text-sm ${selectedId === item.id ? 'bg-amber-500/20 text-white' : 'hover:bg-gray-700 text-gray-200'}`}
                    >
                        {item.name}
                    </button>
                    ))}
                </div>
                </div>
            )}
        </div>
    </div>
  );
};
