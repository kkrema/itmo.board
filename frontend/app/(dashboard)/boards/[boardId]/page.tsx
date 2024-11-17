'use client';

import React, { useEffect, useState } from 'react';
import Toolbar from './_components/Toolbar';
import Canvas from './_components/Canvas';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Layer, LayerType } from '@/types/canvas';

export default function BoardPage() {
    const [color, setColor] = useState('#000000');

    const addLayer = useCanvasStore((state) => state.addLayer);

    useEffect(() => {
        const points = [
            [0, 0],
            [50, 50],
            [100, 0],
            [150, 50],
            [200, 0],
        ];

        const newLayer: Layer = {
            id: 'layer-1',
            type: LayerType.Path,
            x: 100,
            y: 100,
            points: points,
            fill: { r: 0, g: 0, b: 0 },
            height: 200,
            width: 200,
        };

        addLayer(newLayer);
    }, [addLayer]);

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
            <Canvas />
        </div>
    );
}
