"use client";

import React from 'react';

interface ToolbarProps {
    onSelectTool: (tool: string) => void;
    onColorChange: (color: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onSelectTool, onColorChange }) => {
    return (
        <div className="toolbar">
            <button onClick={() => onSelectTool('brush')} className="tool-button">
                🖌️
            </button>
            <button onClick={() => onSelectTool('eraser')} className="tool-button">
                🧽
            </button>
            <input
                type="color"
                onChange={(e) => onColorChange(e.target.value)}
                className="color-picker"
            />
        </div>
    );
};

export default Toolbar;
