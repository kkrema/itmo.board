import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useCanvasStore } from '@/store/useCanvasStore';
import { LayerPreview } from './LayerPreview';
import {
    Camera,
    Color,
    CanvasMode,
    CanvasState,
    Layer,
    LayerType,
    PathLayer,
    Point,
} from '@/types/canvas';
import {
    cn,
    colorToCss,
    findIntersectingLayersWithRectangle,
    penPointsToPathLayer,
    pointerEventToCanvasPoint,
    resizeBounds,
} from '@/lib/utils';
import { ToolBar } from '@/app/(dashboard)/boards/[boardId]/_components/Toolbar';
import { nanoid } from 'nanoid';
import { SelectionTools } from './SelectionTools';
import { StylesButton } from './StylesButton';

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 20;

interface CanvasProps {
    edit?: boolean;
}

const Canvas: React.FC<CanvasProps> = ({ edit }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [svgRect, setSvgRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (svgRef.current) {
            setSvgRect(svgRef.current.getBoundingClientRect());
        }

        const handleResize = () => {
            if (svgRef.current) {
                setSvgRect(svgRef.current.getBoundingClientRect());
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const [showSelectionTools, setShowSelectionTools] = useState(false);

    const [editable, setEditable] = useState(false);

    useEffect(() => {
        if (edit !== false) setEditable(true); // later will depend on user permissions
    }, [edit]);

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

    const [lastUsedColor, setLastUsedColor] = useState<Color>({
        r: 0,
        g: 0,
        b: 0,
    });

    // Determine if any tool is active
    const isAnyToolActive = useMemo(() => {
        return (
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Pressing ||
            canvasState.mode === CanvasMode.Resizing ||
            (canvasState.mode === CanvasMode.Inserting &&
                (canvasState.layerType === LayerType.Text ||
                    canvasState.layerType === LayerType.Note ||
                    canvasState.layerType === LayerType.Rectangle ||
                    canvasState.layerType === LayerType.Ellipse)) ||
            canvasState.mode === CanvasMode.Pencil
        );
    }, [canvasState]);

    const toggleSelectionTools = useCallback(() => {
        if (isAnyToolActive) {
            setShowSelectionTools((prev) => !prev);
        }
    }, [isAnyToolActive]);

    // Map of layer IDs to selection colors
    const layerIdsToColorSelection = useMemo(() => {
        const mapping: Record<string, string> = {};
        selection.forEach((layerId) => {
            mapping[layerId] = 'blue';
        });
        return mapping;
    }, [selection]);

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
                        fill: lastUsedColor,
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
        [addLayer, lastUsedColor],
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

    // Start multi-selection if pointer moved sufficiently
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

    const continueDrawing = useCallback((point: Point) => {
        const roundedPoint = [
            Number(point.x.toFixed(4)),
            Number(point.y.toFixed(4)),
        ];
        setPencilDraft((draft) => {
            if (draft && draft.length > 0) {
                const lastPoint = draft[draft.length - 1];
                const dx = roundedPoint[0] - lastPoint[0];
                const dy = roundedPoint[1] - lastPoint[1];
                const distanceSquared = dx * dx + dy * dy;
                const threshold = 0.001;

                if (distanceSquared > threshold * threshold) {
                    return [...draft, roundedPoint];
                } else {
                    return draft;
                }
            } else {
                return [roundedPoint];
            }
        });
    }, []);

    const insertPath = useCallback(() => {
        if (pencilDraft && pencilDraft.length > 1) {
            const id = nanoid();
            const newLayer: PathLayer = {
                id,
                type: LayerType.Path,
                ...penPointsToPathLayer(pencilDraft),
                fill: lastUsedColor,
            } as PathLayer;
            addLayer(newLayer);
        }
        setPencilDraft(null);
    }, [pencilDraft, lastUsedColor, addLayer]);

    const startDrawing = useCallback((point: Point) => {
        setPencilDraft([[point.x, point.y]]);
    }, []);

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
                Math.max(scale - deltaY * zoomIntensity, MIN_ZOOM),
                MAX_ZOOM,
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
            const point = pointerEventToCanvasPoint(e, camera, scale, svgRect);
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
        [camera, canvasState, scale, startDrawing, svgRect],
    );

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!editable) return;
            e.stopPropagation();
            const point = pointerEventToCanvasPoint(e, camera, scale, svgRect);

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
            svgRect,
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
            const point = pointerEventToCanvasPoint(e, camera, scale, svgRect);
            if (
                canvasState.mode === CanvasMode.None ||
                canvasState.mode === CanvasMode.Pressing
            ) {
                unselectLayers();
                setCanvasState({
                    mode: CanvasMode.None,
                });
            } else if (canvasState.mode === CanvasMode.Pencil && editable) {
                if (pencilDraft) insertPath();
            } else if (canvasState.mode === CanvasMode.Inserting && editable) {
                insertLayer(canvasState.layerType, point);
            } else {
                setCanvasState({
                    mode: CanvasMode.None,
                });
            }
        },
        [
            camera,
            canvasState,
            editable,
            insertLayer,
            insertPath,
            pencilDraft,
            scale,
            svgRect,
            unselectLayers,
        ],
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
            const point = pointerEventToCanvasPoint(e, camera, scale, svgRect);

            const isSelected = selection.includes(layerId);
            const newSelection = isSelected ? selection : [layerId];
            setSelection(newSelection);
            // Start translating
            setCanvasState({ mode: CanvasMode.Translating, current: point });
        },
        [canvasState, editable, camera, scale, svgRect, selection],
    );

    const deleteLayers = useCallback(() => {
        removeLayers(selection);
        setSelection([]);
    }, [removeLayers, selection]);

    const [copiedLayers, setCopiedLayers] = useState<Layer[]>([]);
    const [pasteCount, setPasteCount] = useState(0);

    const copyLayers = useCallback(() => {
        const layersToCopy = getLayers(selection);
        setCopiedLayers(layersToCopy);
        setPasteCount(0);
    }, [getLayers, selection]);

    const pasteLayers = useCallback(() => {
        const offset = 10 * (pasteCount + 1);
        const newLayers = copiedLayers.map((layer) => ({
            ...layer,
            id: nanoid(),
            x: layer.x + offset,
            y: layer.y + offset,
        }));

        newLayers.forEach((newLayer) => addLayer(newLayer));

        const newLayerIds = newLayers.map((layer) => layer.id);
        setSelection(newLayerIds);
        setPasteCount((prevCount) => prevCount + 1);
    }, [addLayer, copiedLayers, pasteCount]);

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
                case 'Delete':
                    deleteLayers();
                    break;
                case 'c': {
                    if (e.ctrlKey || e.metaKey) {
                        copyLayers();
                        break;
                    }
                    break;
                }
                case 'v': {
                    if (e.ctrlKey || e.metaKey) {
                        pasteLayers();
                        break;
                    }
                    break;
                }
                case 'a': {
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

        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [copyLayers, pasteLayers, deleteLayers, selectAllLayers, editable]);

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
                <StylesButton
                    id="styles-button"
                    activeColor={lastUsedColor}
                    onClick={toggleSelectionTools} // Use toggleSelectionTools to control visibility
                    className="h-12 w-30 bg-white rounded-md shadow-md flex items-center justify-center"
                />
            </div>

            <ToolBar
                canvasState={canvasState}
                setCanvasState={setCanvasState}
                editable={editable}
                deleteSelected={deleteLayers}
                moveToFront={handleMoveToFront}
                moveToBack={handleMoveToBack}
                moveForward={handleMoveForward}
                moveBackward={handleMoveBackward}
            />
            {editable && isAnyToolActive && showSelectionTools && (
                <SelectionTools setLastUsedColor={setLastUsedColor} />
            )}
            <svg
                ref={svgRef}
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
                            stroke={colorToCss(lastUsedColor)}
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
