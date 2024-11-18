import React, { useState, useCallback, useEffect } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { LayerPreview } from './LayerPreview';
import { Camera, CanvasMode, CanvasState, Layer, LayerType, Point } from '@/types/canvas';
import { cn, findIntersectingLayersWithRectangle, pointerEventToCanvasPoint, resizeBounds } from '@/lib/utils';
import { ToolBar } from '@/app/(dashboard)/boards/[boardId]/_components/Toolbar';
import { nanoid } from 'nanoid';

const Canvas: React.FC = () => {
    const [editable, setEditable] = useState(false);

    useEffect(() => {
        setEditable(true); // later will depend on user permissions
    }, []);

    const [camera, setCamera] = useState<Camera>({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);

    const [isPanning, setIsPanning] = useState(false);
    const [lastPointerPosition, setLastPointerPosition] = useState({
        x: 0,
        y: 0,
    });

    const [selection, setSelection] = useState<string[]>([]);

    const [canvasState, setCanvasState] = useState<CanvasState>({
        mode: CanvasMode.None,
    });

    const [pencilDraft, setPencilDraft] = useState<number[][] | null>(null);
    // TODO: Pen is not drawing on correct coordinates

    const { layerIds, addLayer, updateLayer, removeLayers, getLayer, getLayers } = useCanvasStore();

    // Map of layer IDs to selection colors
    const layerIdsToColorSelection: Record<string, string> = {};
    selection.forEach((layerId) => {
        layerIdsToColorSelection[layerId] = 'blue';
    });

    const startDrawing = useCallback(
        (point: Point) => {
            setPencilDraft([[point.x, point.y]]);
        },
        [setPencilDraft]
    );

    const continueDrawing = useCallback(
        (point: Point) => {
            setPencilDraft((draft) => {
                if (draft) {
                    return [...draft, [point.x, point.y]];
                } else {
                    return [[point.x, point.y]];
                }
            });
        },
        [setPencilDraft]
    );

    const insertPath = useCallback(() => {
        if (pencilDraft && pencilDraft.length > 1) {
            const id = nanoid();
            const newLayer: Layer = {
                id,
                type: LayerType.Path,
                x: 0,
                y: 0,
                height: 0,
                width: 0,
                fill: { r: 0, g: 0, b: 0 },
                points: pencilDraft,
            };
            addLayer(newLayer);
        }
        setPencilDraft(null);
    }, [pencilDraft, addLayer]);

    const insertLayer = useCallback(
        (layerType: LayerType, position: { x: number; y: number }) => {
            const id = nanoid();

            let layer: Layer;

            switch (layerType) {
                case LayerType.Rectangle:
                    layer = {
                        id,
                        type: LayerType.Rectangle,
                        x: position.x,
                        y: position.y,
                        height: 100,
                        width: 100,
                        fill: { r: 0, g: 0, b: 0 },
                    };
                    // more will be added
                    break;
                default:
                    throw new Error(`Invalid layer type: ${layerType}`);
            }

            addLayer(layer);
            setSelection([id]);
            setCanvasState({ mode: CanvasMode.None });
        },
        [addLayer, setSelection]
    );

    const [dragStartPoint, setDragStartPoint] = useState<Point | null>(null);
    const [dragStartLayers, setDragStartLayers] = useState<{ [id: string]: Layer }>({});

    const translateSelectedLayers = useCallback(
        (currentPoint: Point) => {
            if (canvasState.mode !== CanvasMode.Translating || !editable) return;
            if (!dragStartPoint) return;
            const dx = currentPoint.x - dragStartPoint.x;
            const dy = currentPoint.y - dragStartPoint.y;
            selection.forEach((id) => {
                const initialLayer = dragStartLayers[id];
                if (initialLayer) {
                    updateLayer(id, {
                        x: initialLayer.x + dx,
                        y: initialLayer.y + dy,
                    });
                }
            });
            setCanvasState({ mode: CanvasMode.Translating, current: currentPoint });
        },
        [dragStartPoint, dragStartLayers, selection, updateLayer]
    );

    const unselectLayers = useCallback(() => {
        setSelection([]);
    }, []);

    const updateSelectionNet = useCallback(
        (origin: Point, current: Point) => {
            if (!editable) return;

            const layers = new Map(getLayers(layerIds).map(layer => [layer.id, layer]));
            setCanvasState({ mode: CanvasMode.SelectionNet, origin, current });

            const selectedLayerIds = findIntersectingLayersWithRectangle(
                layerIds,
                layers,
                origin,
                current,
            );

            setSelection(selectedLayerIds);
        },
        [editable, getLayers, layerIds]
    );

    const resizeSelectedLayers = useCallback(
        (currentPoint: Point) => {
            if (canvasState.mode !== CanvasMode.Resizing) return;

            const { initialBounds, corner } = canvasState;
            const newBounds = resizeBounds(initialBounds, corner, currentPoint);

            // Assuming only one selected layer for resizing
            if (selection.length > 0) {
                const layerId = selection[0];
                updateLayer(layerId, {
                    x: newBounds.x,
                    y: newBounds.y,
                    width: newBounds.width,
                    height: newBounds.height,
                });
            }
        },
        [canvasState, selection, updateLayer]
    );

    // Event handlers
    const onWheel = useCallback(
        (e: React.WheelEvent) => {
            e.preventDefault();

            const { clientX, clientY, deltaY } = e;
            const zoomIntensity = 0.001;
            const newScale = Math.min(
                Math.max(scale - deltaY * zoomIntensity, 0.1),
                20,
            ); // Clamp scale

            // Calculate the mouse position relative to the SVG
            const svg = e.currentTarget;
            const rect = svg.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const offsetY = clientY - rect.top;

            // Calculate the new camera position to zoom towards the mouse
            const scaleFactor = newScale / scale;
            const newCameraX = offsetX - (offsetX - camera.x) * scaleFactor;
            const newCameraY = offsetY - (offsetY - camera.y) * scaleFactor;

            setScale(newScale);
            setCamera({ x: newCameraX, y: newCameraY });
        },
        [scale, camera],
    );

    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            const point = pointerEventToCanvasPoint(e, camera);
            if (canvasState.mode === CanvasMode.Inserting) {
                insertLayer(canvasState.layerType, point);
                return;
            }
            if (canvasState.mode === CanvasMode.Pencil) {
                startDrawing(point);
                return;
            }
            if (e.button === 0) {
                if (e.shiftKey) {
                    // Start selection net
                    setCanvasState({
                        mode: CanvasMode.SelectionNet,
                        origin: point,
                        current: point,
                    });
                } else {
                    // Start panning
                    setIsPanning(true);
                    setLastPointerPosition({ x: e.clientX, y: e.clientY });
                }
            }
        },
        [camera, canvasState.mode, insertLayer, startDrawing]
    );


    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (pencilDraft) {
                const point = pointerEventToCanvasPoint(e, camera);
                continueDrawing(point);
            } else if (isPanning) {
                const dx = e.clientX - lastPointerPosition.x;
                const dy = e.clientY - lastPointerPosition.y;
                setCamera((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                setLastPointerPosition({ x: e.clientX, y: e.clientY });
            } else if (canvasState.mode === CanvasMode.Translating) {
                const point = pointerEventToCanvasPoint(e, camera);
                translateSelectedLayers(point);
            } else if (canvasState.mode === CanvasMode.SelectionNet) {
                const point = pointerEventToCanvasPoint(e, camera);
                setCanvasState((prevState) => ({
                    ...prevState,
                    current: point,
                }));
                updateSelectionNet(canvasState.origin, point);
            }
        },
        [
            isPanning,
            lastPointerPosition,
            canvasState,
            translateSelectedLayers,
            pointerEventToCanvasPoint,
            updateSelectionNet,
            pencilDraft,
            continueDrawing,
            camera,
        ]
    );

    const onPointerUp = useCallback(
        (e: React.PointerEvent) => {
            setIsPanning(false);
            if (
                canvasState.mode === CanvasMode.Translating ||
                canvasState.mode === CanvasMode.SelectionNet
            ) {
                setCanvasState({ mode: CanvasMode.None });
                setDragStartPoint(null);
                setDragStartLayers({});
            }
            if (pencilDraft) {
                insertPath();
            }
        },
        [canvasState, insertPath, pencilDraft]
    );

    const onPointerLeave = useCallback(() => {
        setIsPanning(false);
        if (canvasState.mode === CanvasMode.Translating) {
            setCanvasState({ mode: CanvasMode.None });
            setDragStartPoint(null);
            setDragStartLayers({});
        }
    }, [canvasState]);

    const onLayerPointerDown = useCallback(
        (e: React.PointerEvent, layerId: string) => {
            e.stopPropagation();
            const point = pointerEventToCanvasPoint(e, camera);

            if (canvasState.mode === CanvasMode.Pencil) {
                // Do nothing if in drawing mode
                return;
            }

            const isSelected = selection.includes(layerId);
            const newSelection = isSelected ? selection : [layerId];
            setSelection(newSelection);
            // Start translating
            setCanvasState({ mode: CanvasMode.Translating, current: point });
            setDragStartPoint(point);
            // Store initial positions of selected layers
            const initialLayers: { [id: string]: Layer } = {};
            newSelection.forEach((id) => {
                const layer = getLayer(id);
                if (layer) {
                    initialLayers[id] = { ...layer };
                }
            });
            setDragStartLayers(initialLayers);
        },
        [selection, setSelection, getLayer, pointerEventToCanvasPoint, camera, canvasState.mode]
    );


    const deleteLayers = useCallback(() => {
        removeLayers(selection);
        setSelection([]);
    }, [removeLayers, selection]);

    const [copiedLayers, setCopiedLayers] = useState<Layer[]>([]);

    const copyLayers = useCallback(() => {
        const layersToCopy = getLayers(selection);
        setCopiedLayers(layersToCopy.map((layer) => ({ ...layer, id: nanoid() })));
    }, [getLayers, selection]);

    const pasteLayers = useCallback(() => {
        copiedLayers.forEach((layer) => {
            addLayer({ ...layer, x: layer.x + 10, y: layer.y + 10 });
        });
        setSelection(copiedLayers.map((layer) => layer.id));
    }, [addLayer, copiedLayers]);

    const selectAllLayers = useCallback(() => {
        setSelection([...layerIds]);
    }, [layerIds]);

    const handleDeleteSelected = () => {
        deleteLayers();
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
            <ToolBar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                editable={editable}
                deleteSelected={handleDeleteSelected}
                moveToFront={handleMoveToFront}
                moveToBack={handleMoveToBack}
                moveForward={handleMoveForward}
                moveBackward={handleMoveBackward}
            />
            <svg
                data-testid="svg-element"
                className="h-[100vh] w-[100vw]"
                style={{ height: '80vh', width: '98vw' }}
                onWheel={onWheel}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                tabIndex={0}
            >
                <g
                    data-testid="svg-group"
                    transform={`translate(${camera.x}, ${camera.y}) scale(${scale})`}
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
