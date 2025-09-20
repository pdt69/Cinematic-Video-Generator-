import React from 'react';

interface Option {
  label: string;
  value: string;
}

interface OptionSelectorProps<T extends string> {
  label: string;
  options: { label: string; value: T }[];
  selectedValue: T;
  onChange: (value: T) => void;
  type?: 'select' | 'radio';
}

const OptionSelector = <T extends string,>({
  label,
  options,
  selectedValue,
  onChange,
  type = 'select',
}: OptionSelectorProps<T>) => {
  return (
    <div className="w-full mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {type === 'select' ? (
        <select
          value={selectedValue}
          onChange={(e) => onChange(e.target.value as T)}
          className="block w-full bg-brand-gray-light border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-purple focus:border-brand-purple text-white"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-200 transform ${
                selectedValue === option.value
                  ? 'bg-brand-purple text-white font-semibold shadow-lg scale-105 ring-2 ring-brand-purple-light/70'
                  : 'bg-brand-gray-light text-gray-300 hover:bg-gray-600 hover:scale-105'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default OptionSelector;
