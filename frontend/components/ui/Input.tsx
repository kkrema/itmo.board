import React from 'react';

interface InputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const Input: React.FC<InputProps> = ({ value, onChange, placeholder }) => (
    <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
    />
);

export default Input;
