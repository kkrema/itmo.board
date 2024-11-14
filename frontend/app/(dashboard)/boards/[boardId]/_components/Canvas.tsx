import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CanvasProps {
    initialWidth: number;
    initialHeight: number;
    backgroundColor?: string;
    color: string;
    tool: string;
}

const Canvas: React.FC<CanvasProps> = ({
    initialWidth,
    initialHeight,
    backgroundColor = '#ffffff',
    color,
    tool,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    // Resize canvas to fit container
    const [canvasSize, setCanvasSize] = useState({ width: initialWidth, height: initialHeight });
    // Resize canvas when window is resized
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setCanvasSize({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                context.setTransform(scale, 0, 0, scale, offset.x, offset.y);
                context.fillStyle = backgroundColor;
                context.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [canvasSize.width, canvasSize.height, backgroundColor]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            if (context) {
                // Clear and reset transformations
                context.setTransform(1, 0, 0, 1, 0, 0);
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.setTransform(scale, 0, 0, scale, offset.x, offset.y);
                context.fillStyle = backgroundColor;
                context.fillRect(0, 0, canvas.width, canvas.height);
                // TODO: To persist drawings, implement a drawing history or off-screen canvas
            }
        }
    }, [scale, offset, backgroundColor, canvasSize]);

    const getCanvasCoordinates = useCallback(
        (e: React.MouseEvent) => {
            const canvas = canvasRef.current;
            if (!canvas) return { x: 0, y: 0 };
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - offset.x) / scale;
            const y = (e.clientY - rect.top - offset.y) / scale;
            return { x, y };
        },
        [scale, offset]
    );

    const startDrawing = (e: React.MouseEvent) => {
        if (tool !== 'brush') return;
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        const { x, y } = getCanvasCoordinates(e);

        context.strokeStyle = color;
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.beginPath();
        context.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || tool !== 'brush') return;
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (!canvas || !context) return;

        const { x, y } = getCanvasCoordinates(e);
        context.lineTo(x, y);
        context.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        if (canvas && context) {
            context.closePath();
        }
        setIsDrawing(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scaleAmount = 0.1;
        let newScale = scale;
        if (e.deltaY < 0) {
            // Zoom in
            newScale = Math.min(scale + scaleAmount, 3);
        } else {
            // Zoom out
            newScale = Math.max(scale - scaleAmount, 0.5);
        }

        // To zoom towards the mouse position, adjust the offset accordingly
        const { clientX, clientY } = e;
        const canvas = canvasRef.current;
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const x = (clientX - rect.left - offset.x) / scale;
            const y = (clientY - rect.top - offset.y) / scale;

            const newOffset = {
                x: clientX - x * newScale,
                y: clientY - y * newScale,
            };
            setScale(newScale);
            setOffset(newOffset);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (tool === 'pan') {
            setLastPos({ x: e.clientX, y: e.clientY });
            setIsPanning(true);
        } else if (tool === 'brush') {
            startDrawing(e);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (tool === 'pan' && isPanning) {
            const dx = e.clientX - lastPos.x;
            const dy = e.clientY - lastPos.y;
            setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastPos({ x: e.clientX, y: e.clientY });
        } else if (tool === 'brush') {
            draw(e);
        }
    };

    const handleMouseUp = () => {
        if (tool === 'pan') {
            setIsPanning(false);
        } else if (tool === 'brush') {
            stopDrawing();
        }
    };

    return (
        <div
            ref={containerRef}
            style={{
                overflow: 'hidden',
                width: '100%',
                height: '100%',
                position: 'relative',
                cursor: tool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : 'crosshair',
                backgroundColor,
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                style={{
                    border: '1px solid #ddd',
                }}
                id="drawing-canvas"
            />
        </div>
    );
};

export default Canvas;
