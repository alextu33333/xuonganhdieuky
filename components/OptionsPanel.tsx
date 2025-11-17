import React from 'react';
import type { AspectRatio, Resolution } from '../types';
import { ASPECT_RATIOS, NUM_IMAGES_OPTIONS, STYLES, RESOLUTION_OPTIONS, SHOOTING_ANGLES, IMAGE_EFFECTS } from '../constants';
import { SimpleSelector } from './SimpleSelector';

interface OptionsPanelProps {
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  numImages: number;
  setNumImages: (num: number) => void;
  selectedStyle: string;
  setSelectedStyle: (styleId: string) => void;
  resolution: Resolution;
  setResolution: (resolution: Resolution) => void;
  isFullBody: boolean;
  setIsFullBody: (isFull: boolean) => void;
  selectedAngleId: string | null;
  setSelectedAngleId: (id: string | null) => void;
  selectedEffectId: string | null;
  setSelectedEffectId: (id: string | null) => void;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({
  aspectRatio,
  setAspectRatio,
  numImages,
  setNumImages,
  selectedStyle,
  setSelectedStyle,
  resolution,
  setResolution,
  isFullBody,
  setIsFullBody,
  selectedAngleId,
  setSelectedAngleId,
  selectedEffectId,
  setSelectedEffectId
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-amber-300 mb-2">2. Customize Your Portrait</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-md font-medium text-gray-200 mb-2">Kích Thước Ảnh</h3>
            <div className="grid grid-cols-2 gap-2">
              {ASPECT_RATIOS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setAspectRatio(value)}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    aspectRatio === value
                      ? 'bg-amber-500 text-gray-900 font-bold'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {label} ({value})
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-200 mb-2">Số Lượng Ảnh</h3>
            <div className="grid grid-cols-4 gap-2">
              {NUM_IMAGES_OPTIONS.map((num) => (
                <button
                  key={num}
                  onClick={() => setNumImages(num)}
                  className={`px-4 py-2 text-sm rounded-md transition-colors ${
                    numImages === num
                      ? 'bg-amber-500 text-gray-900 font-bold'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-200 mb-2">Độ Phân Giải</h3>
            <div className="grid grid-cols-3 gap-2">
              {RESOLUTION_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setResolution(value)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    resolution === value
                      ? 'bg-amber-500 text-gray-900 font-bold'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
           <div>
            <h3 className="text-md font-medium text-gray-200 mb-2">Phong Cách Nghệ Thuật</h3>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedStyle === style.id
                      ? 'bg-amber-500 text-gray-900 font-bold'
                      : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                  <h3 className="text-md font-medium text-gray-200 mb-2">Kiểu Chụp</h3>
                  <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => setIsFullBody(false)}
                        className={`px-4 py-2 text-sm rounded-md transition-colors ${
                          !isFullBody
                            ? 'bg-amber-500 text-gray-900 font-bold'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        }`}
                      >
                        Mặc định
                      </button>
                      <button
                        onClick={() => setIsFullBody(true)}
                        className={`px-4 py-2 text-sm rounded-md transition-colors ${
                          isFullBody
                            ? 'bg-amber-500 text-gray-900 font-bold'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        }`}
                      >
                        Toàn thân
                      </button>
                  </div>
              </div>
              <div className="space-y-4">
                  <SimpleSelector
                      title="Góc Chụp"
                      items={SHOOTING_ANGLES}
                      selectedId={selectedAngleId}
                      onSelectId={setSelectedAngleId}
                  />
                  <SimpleSelector
                      title="Hiệu Ứng Ảnh"
                      items={IMAGE_EFFECTS}
                      selectedId={selectedEffectId}
                      onSelectId={setSelectedEffectId}
                  />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
