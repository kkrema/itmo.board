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
    );
});

SelectionBox.displayName = "SelectionBox";
