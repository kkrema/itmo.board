import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
    Camera,
    Color,
    Layer,
    LayerType,
    PathLayer,
    Point,
    Side,
    XYWH,
} from '@/types/canvas';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function pointerEventToCanvasPoint(
    e: React.PointerEvent,
    camera: Camera,
    scale: number,
    svgRect: DOMRect | null,
): Point {
    if (!svgRect) {
        return { x: 0, y: 0 };
    }

    const x = (e.clientX - svgRect.left - camera.x) / scale;
    const y = (e.clientY - svgRect.top - camera.y) / scale;
    return { x, y };
}

export function optimizeStroke(
    stroke: number[][],
    precision: number = 4,
    threshold: number = 0.001,
): number[][] {
    if (stroke.length === 0) return [];
    const optimized: number[][] = [];
    const thresholdSquared = threshold * threshold;

    const factor = 10 ** precision;
    const roundPoint = (point: number[]): number[] => {
        const [x, y] = point;
        return [
            Math.round(x * factor) / factor,
            Math.round(y * factor) / factor,
        ];
    };

    let [lastAddedX, lastAddedY] = roundPoint(stroke[0]);
    optimized.push([lastAddedX, lastAddedY]);

    for (let i = 1; i < stroke.length; i++) {
        const [x, y] = roundPoint(stroke[i]);

        const dx = x - lastAddedX;
        const dy = y - lastAddedY;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared > thresholdSquared) {
            optimized.push([x, y]);
            lastAddedX = x;
            lastAddedY = y;
        }
    }
    return optimized;
}

export function getSvgPathFromStroke(stroke: number[][]): string {
    const len = stroke.length;
    if (len === 0) return '';

    // Calculate the size needed for the pathData array:
    // 'M', x, y, 'Q', followed by (x, y, midX, midY) for each point, and 'Z' to close the path
    // 'M', x, y, 'Q', 'Z' = 5
    const pathData = new Array(len * 4 + 5);
    let currIndex = 0;

    pathData[currIndex++] = 'M';
    pathData[currIndex++] = stroke[0][0];
    pathData[currIndex++] = stroke[0][1];
    pathData[currIndex++] = 'Q';

    for (let i = 0; i < len; i++) {
        const current = stroke[i];
        const next = stroke[i + 1] || stroke[0]; // Wrap around to the first point if at the end

        const currentX = current[0];
        const currentY = current[1];
        const nextX = next[0];
        const nextY = next[1];

        pathData[currIndex++] = currentX;
        pathData[currIndex++] = currentY;

        pathData[currIndex++] = (currentX + nextX) / 2;
        pathData[currIndex++] = (currentY + nextY) / 2;
    }

    pathData[currIndex++] = 'Z';

    return pathData.join(' ');
}

export function boundsFromPoints(points: number[][]): XYWH {
    let left = points[0][0];
    let top = points[0][1];
    let right = points[0][0];
    let bottom = points[0][1];

    for (let i = 1; i < points.length; i++) {
        const [x, y] = points[i];

        if (x < left) left = x;
        if (y < top) top = y;
        if (x > right) right = x;
        if (y > bottom) bottom = y;
    }

    return {
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
    };
}

export function colorToCss(color: Color) {
    const toHex = (value: number) => value.toString(16).padStart(2, '0');
    const red = toHex(color.r);
    const green = toHex(color.g);
    const blue = toHex(color.b);
    return `#${red}${green}${blue}`;
}

export const parseColor = (color: string): Color => {
    const hex = color.slice(1); // Remove '#' from color value
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r: r, g: g, b: b };
};

export function findIntersectingLayersWithRectangle(
    layerIds: readonly string[],
    layers: ReadonlyMap<string, Layer>,
    a: Point,
    b: Point,
) {
    const rect = {
        x: Math.min(a.x, b.x),
        y: Math.min(a.y, b.y),
        width: Math.abs(a.x - b.x),
        height: Math.abs(a.y - b.y),
    };

    const rectRight = rect.x + rect.width;
    const rectBottom = rect.y + rect.height;

    const intersectingIds = [];

    for (const layerId of layerIds) {
        const layer = layers.get(layerId);

        if (!layer) continue;

        const { x, y, height, width } = layer;

        if (
            // check if the rectangle intersects with the layer
            rectRight > x &&
            rect.x < x + width &&
            rectBottom > y &&
            rect.y < y + height
        ) {
            intersectingIds.push(layerId);
        }
    }

    return intersectingIds;
}

export function penPointsToPathLayer(points: number[][]): Partial<PathLayer> {
    if (points.length < 2) {
        throw new Error(
            `Invalid input: expected at least 2 points, but received ${points.length}`,
        );
    }

    const bounds = boundsFromPoints(points);

    return {
        type: LayerType.Path,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        points: points.map(([x, y, pressure]) => [
            x - bounds.x,
            y - bounds.y,
            pressure,
        ]),
    };
}

export function resizeBounds(bounds: XYWH, corner: Side, point: Point): XYWH {
    const result = {
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
    };

    if ((corner & Side.Left) === Side.Left) {
        result.x = Math.min(point.x, bounds.x + bounds.width);
        result.width = Math.abs(bounds.x + bounds.width - point.x);
    }

    if ((corner & Side.Right) === Side.Right) {
        result.x = Math.min(point.x, bounds.x);
        result.width = Math.abs(point.x - bounds.x);
    }

    if ((corner & Side.Top) === Side.Top) {
        result.y = Math.min(point.y, bounds.y + bounds.height);
        result.height = Math.abs(bounds.y + bounds.height - point.y);
    }

    if ((corner & Side.Bottom) === Side.Bottom) {
        result.y = Math.min(point.y, bounds.y);
        result.height = Math.abs(point.y - bounds.y);
    }

    return result;
}

export function getContrastingTextColor(color: Color) {
    const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;

    return luminance > 182 ? 'black' : 'white';
}
