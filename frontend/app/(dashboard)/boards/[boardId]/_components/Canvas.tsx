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
                context.fillStyle = backgroundColor;
                context.fillRect(0, 0, width, height);
            }
        }
    }, [width, height, backgroundColor]);

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{ border: "1px solid #ddd" }}
        />
    );
};

export default Canvas;
