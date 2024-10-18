'use client';

import React from 'react';

interface ColorPickerProps {
    color: string;
    onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
    return (
        <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="color-picker"
        />
    );
};

export default ColorPicker;
