import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Color } from '@/types/canvas';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getSvgPathFromStroke(stroke: number[][] ) {
    if (!stroke.length) return '';

    const pathData = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ["M", ...stroke[0], "Q"]
    );

    pathData.push("Z");
    return pathData.join(" ");
}

export function colorToCss(color: Color){
    return `#${color.r.toString(16).padStart(2,"0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2,"0")}`
}