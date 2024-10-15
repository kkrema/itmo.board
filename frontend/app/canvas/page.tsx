import React from 'react';
import Canvas from '../../components/board/Canvas';

export default function CanvasPage() {
    return (
        <div>
            <h1>Тестирование Canvas компонента</h1>
            <Canvas width={800} height={600} backgroundColor="#f0f0f0" />
        </div>
    );
}
