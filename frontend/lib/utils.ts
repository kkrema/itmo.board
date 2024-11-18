import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Camera, Color, Layer, Point, Side, XYWH } from '@/types/canvas';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function pointerEventToCanvasPoint(
    e: React.PointerEvent,
    camera: Camera,
    scale: number
): Point {
    const svg = e.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const x = (screenX - camera.x) / scale;
    const y = (screenY - camera.y) / scale;
    return { x, y };
}

export function getSvgPathFromStroke(stroke: number[][]) {
    if (!stroke.length) return '';

    const pathData = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ['M', ...stroke[0], 'Q'],
    );

    pathData.push('Z');
    return pathData.join(' ');
}

export function colorToCss(color: Color) {
    return `#${color.r.toString(16).padStart(2, '0')}${color.g
        .toString(16)
        .padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
}

export function findIntersectingLayersWithRectangle(
    layerIds: readonly string[],
    layers: ReadonlyMap<string, Layer>,
    a: Point,
    b: Point,
){
    const rect = {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs (a.x - b. x),
        height: Math.abs(a.y - b.y),
    };

    const ids = [];

    for (const layerId of layerIds) {
        const layer = layers.get(layerId);

        if(layer == null ) {
            continue;
        }

        const { x, y, height, width} = layer;

        if(
            rect.x + rect.width > x &&
            rect.x < x + width &&
            rect.y + rect.height > y &&
            rect.y < y + height
        ){
            ids.push(layerId);
        }
    }

    return ids;
}

export function resizeBounds(
    bounds: XYWH,
    corner: Side,
    point: Point
): XYWH {
    const result = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
    };

    if((corner & Side.Left) === Side.Left) {
        result.x = Math.min(point.x, bounds.x + bounds.width);
        result.width = Math.abs(bounds.x + bounds.width - point.x);
    }

    if((corner & Side.Right) === Side.Right) {
        result.x = Math.min(point.x, bounds.x);
        result.width = Math.abs(point.x - bounds.x);
    }

    if((corner & Side.Top) === Side.Top) {
        result.y = Math.min(point.y, bounds.y + bounds.height);
        result.height = Math.abs(bounds.y +bounds.height - point.y);
    }

    if((corner & Side.Bottom) === Side.Bottom) {
        result.y = Math.min(point.y, bounds.y);
        result.height = Math.abs(point.y - bounds.y);
    }

    return result;
}
