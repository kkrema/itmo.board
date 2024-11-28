import { Kalam } from 'next/font/google';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { NoteLayer } from '@/types/canvas';
import { cn, colorToCss, getContrastingTextColor } from '@/lib/utils';
import { useState, useCallback, useRef, useEffect } from 'react';


const font = Kalam({
    subsets: ['latin'],
    weight: ['400'],
});


// Функция для вычисления размера шрифта с учетом ширины и высоты контейнера
const calculateFontSize = (width: number, height: number, text: string) => {
    const maxFontSize = 72;
    const minFontSize = 10; // минимальный размер шрифта
    const scaleFactor = 0.15;


    // Вычисляем максимальный размер шрифта для высоты и ширины
    const fontSizeBasedOnHeight = height * scaleFactor;
    const fontSizeBasedOnWidth = width * scaleFactor;


    // Начальный размер шрифта - минимальное значение из двух
    let fontSize = Math.min(fontSizeBasedOnHeight, fontSizeBasedOnWidth, maxFontSize);


    // Создаем элемент для измерения ширины текста
    const testElement = document.createElement('span');
    testElement.style.fontFamily = 'Kalam';
    testElement.style.position = 'absolute';
    testElement.style.visibility = 'hidden';
    testElement.textContent = text;
    document.body.appendChild(testElement);


    // Если слово слишком длинное, уменьшаем шрифт
    while (testElement.offsetWidth > width && fontSize > minFontSize) {
        fontSize -= 1;
        testElement.style.fontSize = `${fontSize}px`;
    }


    // Убираем элемент из DOM после измерений
    document.body.removeChild(testElement);
    return fontSize;
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
    const [fontSize, setFontSize] = useState(72); // Начальный размер шрифта


    // Ссылаемся на контейнер, который будет определять размеры
    const containerRef = useRef<HTMLDivElement>(null);


    const handleContentChange = useCallback((e: ContentEditableEvent) => {
        setNoteValue(e.target.value);
    }, []);


    const textColor = fill ? getContrastingTextColor(fill) : '#000';
    const backgroundColor = fill ? colorToCss(fill) : '#000';
    const outlineStyle = selectionColor
        ? `1px solid ${selectionColor}`
        : 'none';


    // useEffect для изменения шрифта
    useEffect(() => {
        if (containerRef.current) {
            const contentWidth = containerRef.current.offsetWidth;
            const contentHeight = containerRef.current.offsetHeight;


            // Проверяем, если текст слишком длинный, уменьшаем шрифт с учетом ширины и высоты
            const newFontSize = calculateFontSize(contentWidth, contentHeight, noteValue);


            // Если размер шрифта изменился, обновляем состояние
            if (newFontSize !== fontSize) {
                setFontSize(newFontSize);
            }
        }
    }, [noteValue, fontSize, width, height]);


    return (
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
            <div ref={containerRef} className="h-full w-full flex flex-col items-center justify-center text-center">
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
                        whiteSpace: 'normal', // Позволяем переносу слов
                        wordBreak: 'break-word', // Разрываем длинные слова на части
                    }}
                />
            </div>
        </foreignObject>
    );
};
