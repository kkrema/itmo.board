"use client";

import React, { useRef, useEffect } from 'react';

interface CanvasProps {
    width: number;
    height: number;
    backgroundColor?: string;
    color: string;
    tool: string;
}

const Canvas: React.FC<CanvasProps> = ({ width, height, backgroundColor = "#ffffff" }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d");
            if (context) {
                context.fillStyle = backgroundColor;
                context.fillRect(0, 0, width, height);
            }
        }
    }, [width, height, backgroundColor]);

    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext("2d");
        if (!context || tool !== 'brush') return;

        context.strokeStyle = color;
        context.lineWidth = 2;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        setIsDrawing(true);
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (context) {
            context.closePath();
        }
        setIsDrawing(false);
    };

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{border: "1px solid #ddd"}}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
        />
    );
}

export default Canvas;
