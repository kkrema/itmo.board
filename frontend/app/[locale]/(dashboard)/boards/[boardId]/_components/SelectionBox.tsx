import { memo } from "react";
import { Layer, Side, XYWH } from "@/types/canvas";
import { useSelectionBounds } from "@/hooks/useSelectionBounds";

interface SelectionBoxProps {
    onResizeHandlePointerDown: (corner: Side, initialBounds: XYWH) => void;
    isShowingHandles: boolean;
    selection: string[];
    layersMap: Map<string, Layer>;
}

const HANDLE_WIDTH = 8;

export const SelectionBox = memo(({
                                      onResizeHandlePointerDown,
                                      isShowingHandles,
                                      selection,
                                      layersMap
                                  }: SelectionBoxProps) => {
    const bounds = useSelectionBounds({
        selection,
        layers: layersMap
    });

    if (!bounds) {
        return null;
    }

    return (
        <>
            <rect
                className="fill-transparent stroke-blue-500 stroke-1 pointer-events-none"
                style={{
                    transform: `translate(${bounds.x}px, ${bounds.y}px)`
                }}
                x={0}
                y={0}
                width={bounds.width}
                height={bounds.height}
            />
            {isShowingHandles && (
                <>
                    <rect
                        className="fill-white stroke-1 stroke-blue-500"
                        x={0}
                        y={0}
                        style={{
                            cursor: "nwse-resize",
                            width: `${HANDLE_WIDTH}px`,
                            height: `${HANDLE_WIDTH}px`,
                            transform: `translate(${bounds.x - HANDLE_WIDTH / 2}px, ${bounds.y - HANDLE_WIDTH / 2}px)`
                        }}
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            onResizeHandlePointerDown(Side.Top + Side.Left, bounds);
                        }}
                    />
                </>
            )}
        </>
    );
});

SelectionBox.displayName = "SelectionBox";
