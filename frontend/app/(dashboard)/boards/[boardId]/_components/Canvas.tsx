import React, { useCallback, useEffect, useState } from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { LayerPreview } from './LayerPreview';
import {
    Camera,
    CanvasMode,
    CanvasState,
    Layer,
    LayerType, PathLayer,
    Point,
} from '@/types/canvas';
import {
    cn,
    findIntersectingLayersWithRectangle, penPointsToPathLayer,
    pointerEventToCanvasPoint,
    resizeBounds,
} from '@/lib/utils';
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

    const {
        layerIds,
        addLayer,
        updateLayer,
        removeLayers,
        getLayer,
        getLayers,
    } = useCanvasStore();

    // Map of layer IDs to selection colors
    const layerIdsToColorSelection: Record<string, string> = {};
    selection.forEach((layerId) => {
        layerIdsToColorSelection[layerId] = 'blue';
    });

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
        [addLayer, setSelection],
    );

    const translateSelectedLayers = useCallback(
        (point: Point) => {
            if (canvasState.mode !== CanvasMode.Translating || !editable)
                return;

            const offset = {
                x: point.x - canvasState.current.x,
                y: point.y - canvasState.current.y,
            };

            selection.forEach((id) => {
                const layer = getLayer(id);
                if (layer) {
                    updateLayer(id, {
                        x: layer.x + offset.x,
                        y: layer.y + offset.y,
                    });
                }
            });
            setCanvasState({
                mode: CanvasMode.Translating,
                current: point,
            });
        },
        [canvasState, editable, selection, getLayer, updateLayer],
    );

    const unselectLayers = useCallback(() => {
        setSelection([]);
    }, []);

    const updateSelectionNet = useCallback(
        (current: Point, origin: Point) => {
            if (!editable) return;

            const layers = new Map(
                getLayers(layerIds).map((layer) => [layer.id, layer]),
            );

            setCanvasState({
                mode: CanvasMode.SelectionNet,
                origin,
                current,
            });

            const selectedLayerIds = findIntersectingLayersWithRectangle(
                layerIds,
                layers,
                origin,
                current,
            );

            setSelection(selectedLayerIds);
        },
        [editable, getLayers, layerIds],
    );

    const startMultiSelection = useCallback(
        (current: Point, origin: Point) => {
            if (!editable) return;

            if (
                Math.abs(current.x - origin.x) +
                    Math.abs(current.y - origin.y) >
                5
            ) {
                setCanvasState({
                    mode: CanvasMode.SelectionNet,
                    origin,
                    current,
                });
            }
        },
        [editable],
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
        [setPencilDraft],
    );

    const insertPath = useCallback(() => {
        if (pencilDraft && pencilDraft.length > 1) {
            const id = nanoid();
            const newLayer: PathLayer = {
                id,
                type: LayerType.Path,
                ...penPointsToPathLayer(pencilDraft),
                fill: { r: 0, g: 0, b: 0 }, // TODO: Set fill color
            } as PathLayer;
            addLayer(newLayer);
        }
        setPencilDraft(null);
    }, [pencilDraft, addLayer]);

    const startDrawing = useCallback(
        (point: Point) => {
            setPencilDraft([[point.x, point.y]]);
        },
        [setPencilDraft],
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
        [canvasState, selection, updateLayer],
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
            const point = pointerEventToCanvasPoint(e, camera, scale);
            if (canvasState.mode === CanvasMode.Inserting) {
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
                    setIsPanning(true);
                    setLastPointerPosition({ x: e.clientX, y: e.clientY });
                }
            } else {
                setCanvasState({ mode: CanvasMode.Pressing, origin: point });
            }
        },
        [camera, canvasState, scale, startDrawing],
    );

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!editable) return;

            const point = pointerEventToCanvasPoint(e, camera, scale);

            if (canvasState.mode === CanvasMode.Pressing) {
                startMultiSelection(point, canvasState.origin);
            } else if (canvasState.mode === CanvasMode.SelectionNet) {
                updateSelectionNet(point, canvasState.origin);
            } else if (canvasState.mode === CanvasMode.Translating) {
                translateSelectedLayers(point);
            } else if (canvasState.mode === CanvasMode.Resizing) {
                resizeSelectedLayers(point);
            } else if (canvasState.mode === CanvasMode.Pencil) {
                if (pencilDraft) continueDrawing(point);
            } else if (isPanning) {
                const dx = e.clientX - lastPointerPosition.x;
                const dy = e.clientY - lastPointerPosition.y;
                setCamera((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
                setLastPointerPosition({ x: e.clientX, y: e.clientY });
            }
        },
        [
            editable,
            camera,
            scale,
            canvasState,
            isPanning,
            startMultiSelection,
            updateSelectionNet,
            translateSelectedLayers,
            resizeSelectedLayers,
            pencilDraft,
            continueDrawing,
            lastPointerPosition,
        ],
    );

    const onPointerUp = useCallback(
        (e: React.PointerEvent) => {
            setIsPanning(false);
            const point = pointerEventToCanvasPoint(e, camera, scale);
            if (
                canvasState.mode === CanvasMode.None ||
                canvasState.mode === CanvasMode.Pressing
            ) {
                unselectLayers();
                setCanvasState({
                    mode: CanvasMode.None,
                });
            } else if (canvasState.mode === CanvasMode.Pencil) {
                if (pencilDraft) insertPath();
            } else if (canvasState.mode === CanvasMode.Inserting) {
                insertLayer(canvasState.layerType, point);
            } else {
                setCanvasState({
                    mode: CanvasMode.None,
                });
            }
        },
        [camera, canvasState, insertLayer, insertPath, pencilDraft, scale, unselectLayers],
    );

    const onPointerLeave = useCallback(() => {
        setIsPanning(false);
    }, []);

    const onLayerPointerDown = useCallback(
        (e: React.PointerEvent, layerId: string) => {
            if (
                canvasState.mode === CanvasMode.Pencil ||
                canvasState.mode === CanvasMode.Inserting ||
                !editable
            ) {
                return;
            }
            e.stopPropagation();
            const point = pointerEventToCanvasPoint(e, camera, scale);

            const isSelected = selection.includes(layerId);
            const newSelection = isSelected ? selection : [layerId];
            setSelection(newSelection);
            // Start translating
            setCanvasState({ mode: CanvasMode.Translating, current: point });
        },
        [canvasState, editable, camera, scale, selection],
    );

    const deleteLayers = useCallback(() => {
        removeLayers(selection);
        setSelection([]);
    }, [removeLayers, selection]);

    const [copiedLayers, setCopiedLayers] = useState<Layer[]>([]);

    const copyLayers = useCallback(() => {
        const layersToCopy = getLayers(selection);
        setCopiedLayers(
            layersToCopy.map((layer) => ({ ...layer, id: nanoid() })),
        );
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
    
    // Keyboard Actions
    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (!editable) {
                e.preventDefault();
                return;
            }

            switch (e.key) {
                case "Delete":
                    deleteLayers();
                    break;
                case "c": {
                    if (e.ctrlKey || e.metaKey) {
                        copyLayers();
                        break;
                    }
                    break;
                }
                case "v": {
                    if (e.ctrlKey || e.metaKey) {
                        pasteLayers();
                        break;
                    }
                    break;
                }
                case "a": {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        selectAllLayers();
                        break;
                    }
                    break;
                }
                default:
                    break;
            }
        }

        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [copyLayers, pasteLayers, deleteLayers, selectAllLayers, editable]);

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

                    {/* Render the temporary pencil draft as a preview */}
                    {pencilDraft && pencilDraft.length >= 1 && (
                        <polyline
                            points={pencilDraft
                                .map((point) => point.join(','))
                                .join(' ')}
                            stroke="black"
                            fill="none"
                            strokeWidth={2}
                            strokeDasharray="4 2" // Dashed line for distinction
                        />
                    )}

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
