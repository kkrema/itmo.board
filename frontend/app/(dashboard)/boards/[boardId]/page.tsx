'use client';

import React, { useEffect } from 'react';
import Canvas from './_components/Canvas';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Layer, LayerType } from '@/types/canvas';

export default function BoardPage() {
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

    return (
        <div>
            <Canvas />
        </div>
    );
}
