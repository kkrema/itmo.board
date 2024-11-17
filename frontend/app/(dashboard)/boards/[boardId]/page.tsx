'use client';

import React, { useState } from 'react';
import { ToolBar } from './_components/Toolbar';
import Canvas from './_components/Canvas';

export default function BoardPage() {
    const [color, setColor] = useState('#000000');

    const handleColorChange = (selectedColor: string) => {
        setColor(selectedColor);
        console.log('Выбранный цвет:', selectedColor);
    };

    const handleDeleteSelected = () => {
        console.log('Delete selected');
    };

    const handleMoveToFront = () => {
        console.log('Move to front');
    };

    const handleMoveToBack = () => {
        console.log('Move to back');
    };

    const handleMoveForward = () => {
        console.log('Move forward');
    };

    const handleMoveBackward = () => {
        console.log('Move backward');
    };

    return (
        <div>
            <ToolBar
                onColorChange={handleColorChange}
                currentColor={color}
                editable={true} // example prop
                deleteSelected={handleDeleteSelected}
                moveToFront={handleMoveToFront}
                moveToBack={handleMoveToBack}
                moveForward={handleMoveForward}
                moveBackward={handleMoveBackward}
            />
            <Canvas
                width={800}
                height={600}
                backgroundColor="#f0f0f0"
                color={color}
                tool="brush"
            />
        </div>
    );
}
