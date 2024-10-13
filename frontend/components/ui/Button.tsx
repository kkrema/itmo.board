import React from 'react';

interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
    >
        {label}
    </button>
);

export default Button;
