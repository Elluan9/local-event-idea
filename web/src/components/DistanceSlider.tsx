import React from 'react';

interface DistanceSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export default function DistanceSlider({ value, onChange }: DistanceSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <label className="block text-sm font-medium text-gray-800">
          Distance
        </label>
        <span className="text-sm font-semibold text-blue-600">
          {value} mi
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
          }
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
          }
          .slider::-moz-range-thumb {
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #3b82f6;
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
        `}</style>
      </div>
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <span>1 mi</span>
        <span>10 mi</span>
      </div>
    </div>
  );
}
