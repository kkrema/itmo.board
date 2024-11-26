import { Kalam } from 'next/font/google';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { NoteLayer } from '@/types/canvas';
import { cn, colorToCss, getContrastingTextColor } from '@/lib/utils';
import { useState, useCallback } from 'react';

const font = Kalam({
    subsets: ['latin'],
    weight: ['400'],
});

const calculateFontSize = (width: number, height: number) => {
    const maxFontSize = 72;
    const scaleFactor = 0.15; // Масштабирование текста
    const fontSizeBasedOnHeight = height * scaleFactor;
    const fontSizeBasedOnWidth = width * scaleFactor;

    return Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth, maxFontSize);
};

interface NoteProps {
    id: string;
    layer: NoteLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const Note = ({
    layer,
    onPointerDown,
    id,
    selectionColor,
}: NoteProps) => {
    const { x, y, width, height, fill, value } = layer;

    const [noteValue, setNoteValue] = useState(value || 'Text');

    const handleContentChange = useCallback((e: ContentEditableEvent) => {
        setNoteValue(e.target.value);
    }, []);

    const fontSize = calculateFontSize(width, height);
    const textColor = fill ? getContrastingTextColor(fill) : '#000';
    const backgroundColor = fill ? colorToCss(fill) : '#000';
    const outlineStyle = selectionColor
        ? `1px solid ${selectionColor}`
        : 'none';

    return (
        <svg>
            <foreignObject
                x={x}
                y={y}
                width={width}
                height={height}
                onPointerDown={(e) => onPointerDown(e, id)}
                style={{
                    outline: outlineStyle,
                    backgroundColor: backgroundColor,
                }}
                className="shadow-md drop-shadow-xl p-5"
            >
                <ContentEditable
                    html={noteValue}
                    onChange={handleContentChange}
                    className={cn(
                        'h-full w-full flex flex-col items-center justify-center text-center outline-none',
                        font.className,
                    )}
                    style={{
                        fontSize: `${fontSize}px`,
                        color: textColor,
                    }}
                />
            </foreignObject>
        </svg>
    );
};
