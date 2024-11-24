import { Kalam } from "next/font/google";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";

import { NoteLayer } from "@/types/canvas";
import { cn, colorToCss } from "@/lib/utils";

const font = Kalam({
    subsets: ["latin"],
    weight: ["400"],
});

const calculateFontSize = (width: number, height: number) => {
    const maxFontSize = 72;
    const scaleFactor = 0.15; // Масштабирование текста
    const fontSizeBasedOnHeight = height * scaleFactor;
    const fontSizeBasedOnWidth = width * scaleFactor;

    return Math.min(
        fontSizeBasedOnHeight,
        fontSizeBasedOnWidth,
        maxFontSize
    );
}

interface NoteProps {
    id: string;
    layer: NoteLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
    updateNoteValue?: (id: string, newValue: string) => void;
}

export const Note = ({
                         layer,
                         onPointerDown,
                         id,
                         selectionColor,
                         updateNoteValue,
                     }: NoteProps) => {
    const { x, y, width, height, fill, value } = layer;

    const handleContentChange = (e: ContentEditableEvent) => {
        if (updateNoteValue) {
            updateNoteValue(id, e.target.value);
        }
    }

    return (
        <foreignObject
            x={x}
            y={y}
            width={width}
            height={height}
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                outline: selectionColor ? `1px solid ${selectionColor}` : "none",
                backgroundColor: fill ? colorToCss(fill) : "#000",
            }}
            className="shadow-md drop-shadow-xl p-5"
        >
            <ContentEditable
                html={value || "Text" || ""}
                onChange={handleContentChange}
                className={cn(
                    "h-full w-full flex flex-col items-center justify-center text-center outline-none",
                    font.className
                )}
                style={{
                    fontSize: calculateFontSize(width, height),
                    color: "#000",
                }}
            />
        </foreignObject>
    )
}
