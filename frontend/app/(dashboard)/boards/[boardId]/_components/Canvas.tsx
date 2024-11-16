import React, { useState, useCallback } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { LayerPreview } from './LayerPreview';
import { CanvasMode } from '@/types/canvas';
import { cn } from '@/lib/utils';

const Canvas: React.FC = () => {
    const [camera, setCamera] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);

    const [isPanning, setIsPanning] = useState(false);
    const [lastPointerPosition, setLastPointerPosition] = useState({
        x: 0,
        y: 0,
    });

    const [selection, setSelection] = useState<string[]>([]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [canvasState, setCanvasState] = useState<{
        mode: CanvasMode;
        origin: { x: number; y: number } | null;
        current: { x: number; y: number } | null;
    }>({
        mode: CanvasMode.None,
        origin: null,
        current: null,
    });

    const layerIds = useCanvasStore((state) => state.layerIds);

    // Map of layer IDs to selection colors
    const layerIdsToColorSelection: Record<string, string> = {};
    selection.forEach((layerId) => {
        layerIdsToColorSelection[layerId] = 'blue';
    });

    // Event handlers
    const onWheel = useCallback(
        (e: React.WheelEvent) => {
            e.preventDefault();

            const { clientX, clientY, deltaY } = e;
            const zoomIntensity = 0.001;
            const newScale = Math.min(Math.max(scale - deltaY * zoomIntensity, 0.1), 20); // Clamp scale

            // Calculate the mouse position relative to the SVG
            const svg = e.currentTarget;
            const rect = svg.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const offsetY = clientY - rect.top;

            // Calculate the new camera position to zoom towards the mouse
            const dx = (offsetX / scale - offsetX / newScale);
            const dy = (offsetY / scale - offsetY / newScale);

            setScale(newScale);
            setCamera((prev) => ({
                x: prev.x + dx,
                y: prev.y + dy,
            }));
        },
        [scale],
    );

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        if (e.button === 0) {
            setIsPanning(true);
            setLastPointerPosition({ x: e.clientX, y: e.clientY });
        }
    }, []);

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (isPanning) {
                const dx = (e.clientX - lastPointerPosition.x) / scale;
                const dy = (e.clientY - lastPointerPosition.y) / scale;
                setCamera((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                setLastPointerPosition({ x: e.clientX, y: e.clientY });
            }
        },
        [isPanning, lastPointerPosition, scale],
    );

    const onPointerUp = useCallback(() => {
        setIsPanning(false);
    }, []);

    const onPointerLeave = useCallback(() => {
        setIsPanning(false);
    }, []);

    const onLayerPointerDown = useCallback(
        (e: React.PointerEvent, layerId: string) => {
            e.stopPropagation();
            setSelection((prevSelection) =>
                prevSelection.includes(layerId)
                    ? prevSelection.filter((id) => id !== layerId)
                    : [...prevSelection, layerId],
            );
        },
        [],
    );

    return (
        <main
            className={cn(
                'h-full w-full relative bg-neutral-100 touch-none',
                "bg-[url('/graph-paper.svg')] bg-opacity-20 bg-white",
            )}
        >
            {/* Container for aligning buttons in the top-right corner */}
            <div className="absolute top-2 right-2 flex items-center gap-2">
                {/* Add buttons here if needed */}
            </div>
            <svg
                data-testid="svg-element"
                className="h-[100vh] w-[100vw]"
                style={{ height: '90vh', width: '98vw' }}
                onWheel={onWheel}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                tabIndex={0}
            >
                <g
                    data-testid="svg-group"
                    style={{
                        transform: `translate(${camera.x}px, ${camera.y}px) scale(${scale})`,
                        transition: 'transform 0.1s ease-out',
                    }}
                >
                    {layerIds?.map((layerId) => (
                        <LayerPreview
                            key={layerId}
                            id={layerId}
                            onLayerPointerDown={onLayerPointerDown}
                            selectionColor={layerIdsToColorSelection[layerId]}
                        />
                    ))}

                    {canvasState.mode === CanvasMode.SelectionNet &&
                        canvasState.current != null &&
                        canvasState.origin != null && (
                            <rect
                                className="fill-blue-500/5 stroke-blue-500 stroke-1"
                                x={Math.min(
                                    canvasState.origin.x,
                                    canvasState.current.x,
                                )}
                                y={Math.min(
                                    canvasState.origin.y,
                                    canvasState.current.y,
                                )}
                                width={Math.abs(
                                    canvasState.origin.x -
                                        canvasState.current.x,
                                )}
                                height={Math.abs(
                                    canvasState.origin.y -
                                        canvasState.current.y,
                                )}
                            />
                        )}
                </g>
            </svg>
        </main>
    );
};

export default Canvas;
