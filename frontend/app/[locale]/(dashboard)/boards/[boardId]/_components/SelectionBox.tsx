import { memo } from 'react';
import { Layer, Side, XYWH } from '@/types/canvas';
import { useSelectionBounds } from '@/hooks/useSelectionBounds';

interface SelectionBoxProps {
    onResizeHandlePointerDown: (corner: Side, initialBounds: XYWH) => void;
    isShowingHandles: boolean;
    selection: string[];
    layersMap: Map<string, Layer>;
}

const HANDLE_WIDTH = 8;

interface HandleConfig {
    corner: Side;
    cursor: string;
    translateX: (bounds: XYWH) => number;
    translateY: (bounds: XYWH) => number;
}

export const SelectionBox = memo(
    ({
        onResizeHandlePointerDown,
        isShowingHandles,
        selection,
        layersMap,
    }: SelectionBoxProps) => {
        const bounds = useSelectionBounds({
            selection,
            layers: layersMap,
        });

        if (!bounds) {
            return null;
        }

        const handles: HandleConfig[] = [
            {
                corner: Side.Top + Side.Left,
                cursor: 'nwse-resize',
                translateX: (b) => b.x - HANDLE_WIDTH / 2,
                translateY: (b) => b.y - HANDLE_WIDTH / 2,
            },
            {
                corner: Side.Top,
                cursor: 'ns-resize',
                translateX: (b) => b.x + b.width / 2 - HANDLE_WIDTH / 2,
                translateY: (b) => b.y - HANDLE_WIDTH / 2,
            },
            {
                corner: Side.Top + Side.Right,
                cursor: 'nesw-resize',
                translateX: (b) => b.x + b.width - HANDLE_WIDTH / 2,
                translateY: (b) => b.y - HANDLE_WIDTH / 2,
            },
            {
                corner: Side.Right,
                cursor: 'ew-resize',
                translateX: (b) => b.x + b.width - HANDLE_WIDTH / 2,
                translateY: (b) => b.y + b.height / 2 - HANDLE_WIDTH / 2,
            },
            {
                corner: Side.Bottom + Side.Right,
                cursor: 'nwse-resize',
                translateX: (b) => b.x + b.width - HANDLE_WIDTH / 2,
                translateY: (b) => b.y + b.height - HANDLE_WIDTH / 2,
            },
            {
                corner: Side.Bottom,
                cursor: 'ns-resize',
                translateX: (b) => b.x + b.width / 2 - HANDLE_WIDTH / 2,
                translateY: (b) => b.y + b.height - HANDLE_WIDTH / 2,
            },
            {
                corner: Side.Bottom + Side.Left,
                cursor: 'nesw-resize',
                translateX: (b) => b.x - HANDLE_WIDTH / 2,
                translateY: (b) => b.y + b.height - HANDLE_WIDTH / 2,
            },
            {
                corner: Side.Left,
                cursor: 'ew-resize',
                translateX: (b) => b.x - HANDLE_WIDTH / 2,
                translateY: (b) => b.y + b.height / 2 - HANDLE_WIDTH / 2,
            },
        ];

        return (
            <>
                {/* Контур выделения */}
                <rect
                    data-testid="selection-rectangle"
                    className="fill-transparent stroke-blue-500 stroke-1 pointer-events-none"
                    style={{
                        transform: `translate(${bounds.x}px, ${bounds.y}px)`,
                    }}
                    x={0}
                    y={0}
                    width={bounds.width}
                    height={bounds.height}
                />
                {isShowingHandles &&
                    handles.map(
                        ({ corner, cursor, translateX, translateY }, index) => (
                            <rect
                                key={index}
                                data-testid={`handle-${index}`}
                                className="fill-white stroke-1 stroke-blue-500"
                                x={0}
                                y={0}
                                style={{
                                    cursor,
                                    width: `${HANDLE_WIDTH}px`,
                                    height: `${HANDLE_WIDTH}px`,
                                    transform: `translate(${translateX(
                                        bounds,
                                    )}px, ${translateY(bounds)}px)`,
                                }}
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    onResizeHandlePointerDown(corner, bounds);
                                }}
                            />
                        ),
                    )}
            </>
        );
    },
);

SelectionBox.displayName = 'SelectionBox';
