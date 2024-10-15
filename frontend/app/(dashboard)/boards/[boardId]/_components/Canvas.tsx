"use client";

import React, { useRef, useEffect } from 'react';

interface CanvasProps {
    width: number;
    height: number;
    backgroundColor?: string;
}

const Canvas: React.FC<CanvasProps> = ({ width, height, backgroundColor = "#ffffff" }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext("2d");
            if (context) {
                // Установка фона
                context.fillStyle = backgroundColor;
                context.fillRect(0, 0, width, height);

                // Отрисовка текста на холсте
                context.fillStyle = "#000";
                context.font = "20px Arial";
                context.fillText("Добро пожаловать на Canvas", 10, 50);
            }
        }
    }, [width, height, backgroundColor]);

    return <canvas ref={canvasRef} width={width} height={height} style={{ border: "1px solid #ddd" }} />;
};

export default Canvas;
