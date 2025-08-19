import React from 'react';

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}

export default function SegmentedControl({ options, value, onChange, label }: SegmentedControlProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-800 px-1">
        {label}
      </label>
      <div className="bg-gray-200 rounded-xl p-1 flex">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              value === option
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}