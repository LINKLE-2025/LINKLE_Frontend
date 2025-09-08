import React from 'react';

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  disabled = false,
}: InputFieldProps) {
  return (
    <div className="px-4 py-3 border-b border-gray-100 bg-white">
      <div className="flex items-center">
        <label className="w-16 text-gray-600 text-sm">{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 text-gray-900 text-base bg-transparent outline-none disabled:text-gray-400"
        />
      </div>
    </div>
  );
}

export default InputField;
