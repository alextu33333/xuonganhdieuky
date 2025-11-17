import React, { useState, useRef, useEffect } from 'react';
import type { Scene, Costume } from '../types';
import { ChevronDownIcon } from './icons';

type SelectableItem = Scene | Costume;

interface ItemSelectorProps {
  title: string;
  items: SelectableItem[];
  selectedItem: SelectableItem | null;
  onSelectItem: (item: SelectableItem | null) => void;
  disabled?: boolean;
}

export const ItemSelector: React.FC<ItemSelectorProps> = ({ title, items, selectedItem, onSelectItem, disabled = false }) => {
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

  const handleSelect = (item: SelectableItem | null) => {
    onSelectItem(item);
    setIsOpen(false);
  };

  const isItemSelectedFromThisList = selectedItem && items.some(s => s.id === selectedItem.id);
  const currentSelection = isItemSelectedFromThisList ? selectedItem : null;
  const buttonText = currentSelection?.name ?? `Chọn ${title}...`;
  const buttonImage = currentSelection?.imageUrl;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-left flex items-center justify-between transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="flex items-center min-w-0">
          {buttonImage && (
            <img src={buttonImage} alt={currentSelection?.name} className="w-8 h-8 object-cover rounded-md mr-3 flex-shrink-0" />
          )}
          <span className="text-white truncate">{buttonText}</span>
        </span>
        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleSelect(null)}
              className="w-full text-left flex items-center p-2 rounded-md transition-colors hover:bg-gray-700"
            >
              <span className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-md flex-shrink-0 text-gray-400 font-bold text-lg">
                ✕
              </span>
              <span className="ml-3 text-sm text-gray-200 font-semibold">Không chọn</span>
            </button>
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`w-full text-left flex items-center p-2 rounded-md transition-colors ${selectedItem?.id === item.id ? 'bg-amber-500/20' : 'hover:bg-gray-700'}`}
              >
                <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded-md flex-shrink-0" />
                <span className="ml-3 text-sm text-gray-200">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
