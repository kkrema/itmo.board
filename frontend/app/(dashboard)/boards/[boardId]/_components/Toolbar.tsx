'use client';

import React from 'react';
import ColorPicker from './ColorPicker';

interface ToolbarProps {
    onSelectTool: (tool: string) => void;
    onColorChange: (color: string) => void;
    currentColor: string;
}

const Toolbar: React.FC<ToolbarProps> = ({
    onSelectTool,
    onColorChange,
    currentColor,
}) => {
    return (
        <div className="toolbar">
            <button
                onClick={() => onSelectTool('brush')}
                className="tool-button"
            >
                🖌️
            </button>
            <button
                onClick={() => onSelectTool('eraser')}
                className="tool-button"
            >
                🧽
            </button>
            <ColorPicker color={currentColor} onChange={onColorChange} />
        </div>
    );
};

export default Toolbar;
