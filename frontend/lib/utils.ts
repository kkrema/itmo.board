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
    const len = stroke.length;
    if (len === 0) return '';

    const pathData = ['M', ...stroke[0], 'Q'];

    for (let i = 0; i < len; i++) {
        const [x0, y0] = stroke[i];
        const [x1, y1] = stroke[(i + 1) % len];
        pathData.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
    }

    pathData.push('Z');
    return pathData.join(' ');
}

export function colorToCss(color: Color) {
    const toHex = (value: number) => value.toString(16).padStart(2, '0');
    const red = toHex(color.r);
    const green = toHex(color.g);
    const blue = toHex(color.b);

    return `#${red}${green}${blue}`;
}

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

    let left = Number.POSITIVE_INFINITY;
    let top = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;

    for (const point of points) {
        const [x, y] = point;

        // limit the range
        if (left > x) {
            left = x;
        }

        if (top > y) {
            top = y;
        }

        if (right < x) {
            right = x;
        }

        if (bottom < y) {
            bottom = y;
        }
    }

    return {
        type: LayerType.Path,
        x: left,
        y: top,
        width: right - left,
        height: bottom - top,
        points: points.map(([x, y, pressure]) => [x - left, y - top, pressure]),
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
