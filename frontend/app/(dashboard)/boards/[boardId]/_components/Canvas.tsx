"use client";

import React, { useRef, useEffect, useState } from 'react';

interface CanvasProps {
    width: number;
    height: number;
    backgroundColor?: string;
    color: string;
    tool: string;
}

const Canvas: React.FC<CanvasProps> = ({ width, height, backgroundColor = "#ffffff", color, tool }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

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

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || tool !== 'brush') return;
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");
        if (context) {
            context.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
            context.stroke();
        }
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
            style={{ border: "1px solid #ddd" }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
        />
    );
};

export default Canvas;
