'use client';

import React, { useState } from 'react';
import Toolbar from './_components/Toolbar';
import Canvas from './_components/Canvas';

export default function BoardPage() {
    const [tool, setTool] = useState('brush');
    const [color, setColor] = useState('#000000');

    const handleToolSelect = (selectedTool: string) => {
        setTool(selectedTool);
        console.log('Выбранный инструмент:', selectedTool);
    };

    const handleColorChange = (selectedColor: string) => {
        setColor(selectedColor);
        console.log('Выбранный цвет:', selectedColor);
    };

    return (
        <div>
            <Toolbar
                onSelectTool={handleToolSelect}
                onColorChange={handleColorChange}
                currentColor={color}
            />
            <Canvas
                width={800}
                height={600}
                backgroundColor="#f0f0f0"
                color={color}
                tool={tool}
            />
        </div>
    );
}
