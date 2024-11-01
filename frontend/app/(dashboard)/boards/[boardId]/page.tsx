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

    return (
        <div>
            <ToolBar
                onColorChange={handleColorChange}
                currentColor={color}
                editable={true} // example prop
                deleteSelected={() => console.log('Delete selected')} // example function
                moveToFront={() => console.log('Move to front')} // example function
                moveToBack={() => console.log('Move to back')} // example function
                moveForward={() => console.log('Move forward')} // example function
                moveBackward={() => console.log('Move backward')} // example function
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
