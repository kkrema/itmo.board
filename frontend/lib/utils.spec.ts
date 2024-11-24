import {
    cn,
    colorToCss,
    findIntersectingLayersWithRectangle,
    getSvgPathFromStroke,
    optimizeStroke,
    parseColor,
    penPointsToPathLayer,
    pointerEventToCanvasPoint,
    resizeBounds,
} from './utils';
import {
    Camera,
    Color,
    Layer,
    LayerType,
    Point,
    Side,
    XYWH,
} from '@/types/canvas';
import { twMerge } from 'tailwind-merge';
import {
    MAX_ZOOM,
    MIN_ZOOM,
} from '@/app/(dashboard)/boards/[boardId]/_components/Canvas';

jest.mock('clsx', () => ({
    __esModule: true,
    clsx: (...args: string[]) => args.flat().filter(Boolean).join(' '),
}));

jest.mock('tailwind-merge', () => ({
    __esModule: true,
    twMerge: jest.fn((classes: string) => classes),
}));

jest.mock('nanoid', () => ({
    nanoid: () => 'nanoid',
}));

const createPointerEvent = (
    clientX: number,
    clientY: number,
    boundingRect: DOMRect,
) => {
    return {
        clientX,
        clientY,
        currentTarget: {
            getBoundingClientRect: () => boundingRect,
        },
    } as unknown as React.PointerEvent<SVGSVGElement>;
};

describe('Utility Functions', () => {
    describe('cn', () => {
        it('should merge class names correctly', () => {
            const result = cn('class1', 'class2', 'class3');
            expect(result).toBe('class1 class2 class3');
        });

        it('should handle conditional class names', () => {
            const isActive = true;
            const isDisabled = false;
            const result = cn(
                'base',
                isActive && 'active',
                isDisabled && 'disabled',
            );
            expect(result).toBe('base active');
        });

        it('should remove duplicate class names using twMerge', () => {
            (twMerge as jest.Mock).mockImplementationOnce((classes: string) => {
                return Array.from(new Set(classes.split(' '))).join(' ');
            });

            const result = cn('class1', 'class2', 'class1');
            expect(result).toBe('class1 class2');
        });
    });

    describe('pointerEventToCanvasPoint', () => {
        it('should correctly convert pointer event to canvas point', () => {
            const clientX = 150;
            const clientY = 200;
            const boundingRect = {
                left: 100,
                top: 100,
                right: 300,
                bottom: 300,
                width: 200,
                height: 200,
                x: 100,
                y: 100,
                toJSON: () => {},
            } as DOMRect;

            const event = createPointerEvent(clientX, clientY, boundingRect);
            const camera: Camera = { x: 50, y: 50 };
            const scale = 2;

            const result = pointerEventToCanvasPoint(
                event,
                camera,
                scale,
                boundingRect,
            );
            // Calculation:
            // screenX = 150 - 100 = 50
            // screenY = 200 - 100 = 100
            // x = (50 - 50) / 2 = 0
            // y = (100 - 50) / 2 = 25

            expect(result).toEqual({ x: 0, y: 25 });
        });

        it('should handle negative coordinates', () => {
            const clientX = 80;
            const clientY = 90;
            const boundingRect = {
                left: 100,
                top: 100,
                right: 300,
                bottom: 300,
                width: 200,
                height: 200,
                x: 100,
                y: 100,
                toJSON: () => {},
            } as DOMRect;

            const event = createPointerEvent(clientX, clientY, boundingRect);
            const camera: Camera = { x: 50, y: 50 };
            const scale = 2;

            const result = pointerEventToCanvasPoint(
                event,
                camera,
                scale,
                boundingRect,
            );
            // screenX = 80 - 100 = -20
            // screenY = 90 - 100 = -10
            // x = (-20 - 50) / 2 = -35
            // y = (-10 - 50) / 2 = -30

            expect(result).toEqual({ x: -35, y: -30 });
        });

        it('should handle limit scales', () => {
            const clientX = 150;
            const clientY = 200;
            const boundingRect = {
                left: 100,
                top: 100,
                right: 300,
                bottom: 300,
                width: 200,
                height: 200,
                x: 100,
                y: 100,
                toJSON: () => {},
            } as DOMRect;

            const event = createPointerEvent(clientX, clientY, boundingRect);
            const camera: Camera = { x: 50, y: 50 };
            const result = pointerEventToCanvasPoint(
                event,
                camera,
                MIN_ZOOM,
                boundingRect,
            );

            // Calculation:
            // screenX = 150 - 100 = 50
            // screenY = 200 - 100 = 100
            // x = (50 - 50) / 0.1 = 0
            // y = (100 - 50) / 0.1 = 500

            expect(result).toEqual({ x: 0, y: 500 });

            const result2 = pointerEventToCanvasPoint(
                event,
                camera,
                MAX_ZOOM,
                boundingRect,
            );

            // Calculation:
            // x = (50 - 50) / 20 = 0
            // y = (100 - 50) / 20 = 2.5

            expect(result2).toEqual({ x: 0, y: 2.5 });
        });
    });

    describe('optimizeStroke', () => {
        it('should return an empty array when the input stroke is empty', () => {
            const stroke: number[][] = [];
            const result = optimizeStroke(stroke);
            expect(result).toEqual([]);
        });

        it('should return the same single point when the stroke has only one point', () => {
            const stroke: number[][] = [[10.12345, 20.67891]];
            const expected: number[][] = [[10.1235, 20.6789]]; // Rounded to 4 decimal places
            const result = optimizeStroke(stroke);
            expect(result).toEqual(expected);
        });

        it('should include all points when all points are beyond the threshold', () => {
            const stroke: number[][] = [
                [0, 0],
                [1, 1],
                [2, 2],
                [3, 3],
            ];
            const result = optimizeStroke(stroke, 2, 0.5);
            expect(result).toEqual([
                [0.0, 0.0],
                [1.0, 1.0],
                [2.0, 2.0],
                [3.0, 3.0],
            ]);
        });

        it('should remove consecutive points that are within the threshold', () => {
            const stroke: number[][] = [
                [0, 0],
                [0.0005, 0.0005],
                [1, 1],
                [1.0004, 1.0004],
                [2, 2],
            ];
            const result = optimizeStroke(stroke, 4, 0.001);
            expect(result).toEqual([
                [0.0, 0.0],
                [1.0, 1.0],
                [2.0, 2.0],
            ]);
        });

        it('should correctly handle precision by rounding points', () => {
            const stroke: number[][] = [
                [10.123456, 20.654321],
                [10.123455, 20.65432],
                [10.123457, 20.654322],
            ];
            const result = optimizeStroke(stroke, 5, 0.0001);
            expect(result).toEqual([[10.12346, 20.65432]]);
        });

        it('should respect the threshold parameter correctly', () => {
            const stroke: number[][] = [
                [0, 0],
                [0.5, 0.5],
                [1, 1],
                [1.5, 1.5],
                [2, 2],
            ];
            const resultHighThreshold = optimizeStroke(stroke, 3, 1.0);
            expect(resultHighThreshold).toEqual([
                [0.0, 0.0],
                [1.0, 1.0],
                [2.0, 2.0],
            ]);

            const resultLowThreshold = optimizeStroke(stroke, 3, 0.49999);
            expect(resultLowThreshold).toEqual([
                [0.0, 0.0],
                [0.5, 0.5],
                [1.0, 1.0],
                [1.5, 1.5],
                [2.0, 2.0],
            ]);
        });

        it('should handle strokes with varying distances between points', () => {
            const stroke: number[][] = [
                [0, 0],
                [0.0001, 0.0001],
                [0.002, 0.002],
                [0.005, 0.005],
                [0.01, 0.01],
            ];
            const result = optimizeStroke(stroke, 4, 0.001);
            expect(result).toEqual([
                [0.0, 0.0],
                [0.002, 0.002],
                [0.005, 0.005],
                [0.01, 0.01],
            ]);
        });

        it('should ensure the first point is always included', () => {
            const stroke: number[][] = [
                [5, 5],
                [5.0001, 5.0001],
                [10, 10],
            ];
            const result = optimizeStroke(stroke, 4, 0.001);
            expect(result[0]).toEqual([5.0, 5.0]);
        });

        it('should work correctly with different precision settings', () => {
            const stroke: number[][] = [
                [1.123456, 2.654321],
                [1.123457, 2.654322],
                [1.123458, 2.654323],
            ];
            const resultPrecision3 = optimizeStroke(stroke, 3, 0.001);
            expect(resultPrecision3).toEqual([[1.123, 2.654]]);

            const resultPrecision2 = optimizeStroke(stroke, 2, 0.001);
            expect(resultPrecision2).toEqual([[1.12, 2.65]]);
        });

        it('should handle threshold zero by including all rounded points', () => {
            const stroke: number[][] = [
                [0, 0],
                [0.0001, 0.0001],
                [1, 1],
            ];
            const result = optimizeStroke(stroke, 4, 0);
            expect(result).toEqual([
                [0.0, 0.0],
                [0.0001, 0.0001],
                [1.0, 1.0],
            ]);
        });
    });

    describe('getSvgPathFromStroke', () => {
        it('should return an empty string for empty stroke', () => {
            const result = getSvgPathFromStroke([]);
            expect(result).toBe('');
        });

        it('should handle a single point', () => {
            const stroke = [[10, 20]];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe('M 10 20 Q 10 20 10 20 Z');
        });

        it('should handle multiple points in line', () => {
            const stroke = [
                [10, 20],
                [30, 40],
                [50, 60],
            ];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe(
                'M 10 20 Q 10 20 20 30 30 40 40 50 50 60 30 40 Z',
            );
        });

        it('should correctly handle closed paths', () => {
            const stroke = [
                [0, 0],
                [100, 0],
                [100, 100],
                [0, 100],
            ];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe(
                'M 0 0 Q 0 0 50 0 100 0 100 50 100 100 50 100 0 100 0 50 Z',
            );
        });

        it('should handle a curve with multiple points', () => {
            const stroke = [
                [10, 20],
                [5, 40],
                [50, 60],
                [70, 80],
            ];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe(
                'M 10 20 Q 10 20 7.5 30 5 40 27.5 50 50 60 60 70 70 80 40 50 Z',
            );
        });

        it('should handle strokes with negative coordinates', () => {
            const stroke = [
                [-10, -20],
                [-30, -40],
                [-50, -60],
            ];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe(
                'M -10 -20 Q -10 -20 -20 -30 -30 -40 -40 -50 -50 -60 -30 -40 Z',
            );
        });

        it('should handle strokes with decimal coordinates', () => {
            const stroke = [
                [10.5, 20.5],
                [30.25, 40.75],
                [50.125, 60.875],
            ];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe(
                'M 10.5 20.5 Q 10.5 20.5 20.375 30.625 30.25 40.75 40.1875 50.8125 50.125 60.875 30.3125 40.6875 Z',
            );
        });

        it('should handle strokes that loop back to the starting point', () => {
            const stroke = [
                [0, 0],
                [100, 0],
                [100, 100],
                [0, 100],
                [0, 0],
            ];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe(
                'M 0 0 Q 0 0 50 0 100 0 100 50 100 100 50 100 0 100 0 50 0 0 0 0 Z',
            );
        });

        it('should handle strokes with colinear points', () => {
            const stroke = [
                [0, 0],
                [50, 50],
                [100, 100],
            ];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe(
                'M 0 0 Q 0 0 25 25 50 50 75 75 100 100 50 50 Z',
            );
        });

        it('should handle large number of points efficiently', () => {
            const stroke: number[][] = [];
            for (let i = 0; i <= 1000; i++) {
                stroke.push([i, i]);
            }
            const result = getSvgPathFromStroke(stroke);
            // Since all points are in a straight line, the path should reflect that
            expect(result.startsWith('M 0 0 Q')).toBe(true);
            expect(result.endsWith('Z')).toBe(true);
            // Optionally, verify the length or specific segments
            expect(result.split(' ').length).toBe(4 + 1001 * 4 + 1);
        });

        it('should handle strokes with overlapping points', () => {
            const stroke = [
                [10, 10],
                [10, 10],
                [20, 20],
                [20, 20],
                [30, 30],
            ];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe(
                'M 10 10 Q 10 10 10 10 10 10 15 15 20 20 20 20 20 20 25 25 30 30 20 20 Z',
            );
        });
    });

    describe('colorToCss', () => {
        it('should convert color to hex string correctly', () => {
            const color: Color = { r: 255, g: 165, b: 0 }; // Orange
            const result = colorToCss(color);
            expect(result).toBe('#ffa500');
        });

        it('should pad single digit hex values with zero', () => {
            const color: Color = { r: 5, g: 15, b: 25 };
            const result = colorToCss(color);
            expect(result).toBe('#050f19');
        });

        it('should handle zero values correctly', () => {
            const color: Color = { r: 0, g: 0, b: 0 };
            const result = colorToCss(color);
            expect(result).toBe('#000000');
        });

        it('should handle maximum values correctly', () => {
            const color: Color = { r: 255, g: 255, b: 255 };
            const result = colorToCss(color);
            expect(result).toBe('#ffffff');
        });
    });

    describe('parseColor', () => {
        it('should correctly parse black color', () => {
            const color: string = '#000000';
            const expected: Color = { r: 0, g: 0, b: 0 };
            const result = parseColor(color);
            expect(result).toEqual(expected);
        });

        it('should correctly parse white color', () => {
            const color: string = '#ffffff';
            const expected: Color = { r: 255, g: 255, b: 255 };
            const result = parseColor(color);
            expect(result).toEqual(expected);
        });

        it('should correctly parse orange color with uppercase letters', () => {
            const color: string = '#FFA500';
            const expected: Color = { r: 255, g: 165, b: 0 };
            const result = parseColor(color);
            expect(result).toEqual(expected);
        });

        it('should correctly parse mixed case colors', () => {
            const color: string = '#AbCdEf';
            const expected: Color = { r: 171, g: 205, b: 239 };
            const result = parseColor(color);
            expect(result).toEqual(expected);
        });

        it('should correctly parse arbitrary color "#123456"', () => {
            const color: string = '#123456';
            const expected: Color = { r: 18, g: 52, b: 86 };
            const result = parseColor(color);
            expect(result).toEqual(expected);
        });

        // Invalid Inputs

        it('should return NaN for red component if hex is invalid', () => {
            const color: string = '#GGGGGG';
            const result = parseColor(color);
            expect(result.r).toBeNaN();
            expect(result.g).toBeNaN();
            expect(result.b).toBeNaN();
        });

        it('should return partial NaN values for partially invalid hex', () => {
            const color: string = '#12G455';
            const result = parseColor(color);
            expect(result.r).toBe(18); // '12' => 18
            expect(result.g).toBeNaN(); // 'G4' => NaN
            expect(result.b).toBe(85); // '55' => 85
        });

        it('should handle empty string', () => {
            const color: string = '';
            const result = parseColor(color);
            expect(result.r).toBeNaN();
            expect(result.g).toBeNaN();
            expect(result.b).toBeNaN();
        });

        it('should handle string with only "#"', () => {
            const color: string = '#';
            const result = parseColor(color);
            expect(result.r).toBeNaN();
            expect(result.g).toBeNaN();
            expect(result.b).toBeNaN();
        });
    });

    describe('findIntersectingLayersWithRectangle', () => {
        it('should return empty array when no layers intersect', () => {
            const layerIds = ['layer1', 'layer2'];
            const layers = new Map<string, Layer>([
                ['layer1', { x: 100, y: 100, width: 50, height: 50 } as Layer],
                ['layer2', { x: 200, y: 200, width: 50, height: 50 } as Layer],
            ]);
            const a: Point = { x: 0, y: 0 };
            const b: Point = { x: 50, y: 50 };

            const result = findIntersectingLayersWithRectangle(
                layerIds,
                layers,
                a,
                b,
            );
            expect(result).toEqual([]);
        });

        it('should return intersecting layer IDs', () => {
            const layerIds = ['layer1', 'layer2', 'layer3'];
            const layers = new Map<string, Layer>([
                ['layer1', { x: 10, y: 10, width: 30, height: 30 } as Layer],
                ['layer2', { x: 25, y: 25, width: 50, height: 50 } as Layer],
                ['layer3', { x: 100, y: 100, width: 20, height: 20 } as Layer],
            ]);
            const a: Point = { x: 20, y: 20 };
            const b: Point = { x: 60, y: 60 };

            const result = findIntersectingLayersWithRectangle(
                layerIds,
                layers,
                a,
                b,
            );
            expect(result).toEqual(['layer1', 'layer2']);
        });

        it('should handle layers not present in the map', () => {
            const layerIds = ['layer1', 'layer2', 'layer3'];
            const layers = new Map<string, Layer>([
                ['layer1', { x: 10, y: 10, width: 30, height: 30 } as Layer],
                // 'layer2' is missing
                ['layer3', { x: 100, y: 100, width: 20, height: 20 } as Layer],
            ]);
            const a: Point = { x: 0, y: 0 };
            const b: Point = { x: 50, y: 50 };

            const result = findIntersectingLayersWithRectangle(
                layerIds,
                layers,
                a,
                b,
            );
            expect(result).toEqual(['layer1']);
        });

        it('should handle zero width or height rectangle', () => {
            const layerIds = ['layer1', 'layer2'];
            const layers = new Map<string, Layer>([
                ['layer1', { x: 10, y: 10, width: 30, height: 30 } as Layer],
                ['layer2', { x: 40, y: 40, width: 10, height: 10 } as Layer],
            ]);
            const a: Point = { x: 20, y: 20 };
            const b: Point = { x: 20, y: 50 }; // Zero width

            const result = findIntersectingLayersWithRectangle(
                layerIds,
                layers,
                a,
                b,
            );
            expect(result).toEqual(['layer1']);
        });

        it('should handle rectangle with negative coordinates', () => {
            const layerIds = ['layer1', 'layer2'];
            const layers = new Map<string, Layer>([
                ['layer1', { x: -30, y: -30, width: 20, height: 20 } as Layer],
                ['layer2', { x: -10, y: -10, width: 40, height: 40 } as Layer],
            ]);
            const a: Point = { x: -20, y: -20 };
            const b: Point = { x: 10, y: 10 };

            const result = findIntersectingLayersWithRectangle(
                layerIds,
                layers,
                a,
                b,
            );
            expect(result).toEqual(['layer1', 'layer2']);
        });
    });

    describe('penPointsToPathLayer', () => {
        it('should throw an error when less than 2 points are provided', () => {
            const points: number[][] = [[10, 20, 0.5]];
            expect(() => penPointsToPathLayer(points)).toThrow(
                `Invalid input: expected at least 2 points, but received ${points.length}`,
            );
        });

        it('should correctly transform two points', () => {
            const points: number[][] = [
                [10, 20, 0.5],
                [30, 40, 0.7],
            ];
            const result = penPointsToPathLayer(points);
            expect(result).toEqual({
                type: LayerType.Path,
                x: 10,
                y: 20,
                width: 20,
                height: 20,
                points: [
                    [0, 0, 0.5],
                    [20, 20, 0.7],
                ],
            });
        });

        it('should correctly transform multiple points', () => {
            const points: number[][] = [
                [10, 20, 0.5],
                [5, 40, 0.6],
                [50, 60, 0.8],
                [70, 80, 0.9],
            ];
            const result = penPointsToPathLayer(points);
            expect(result).toEqual({
                type: LayerType.Path,
                x: 5,
                y: 20,
                width: 65, // 70 - 5
                height: 60, // 80 - 20
                points: [
                    [10 - 5, 20 - 20, 0.5],
                    [5 - 5, 40 - 20, 0.6],
                    [50 - 5, 60 - 20, 0.8],
                    [70 - 5, 80 - 20, 0.9],
                ],
            });
        });

        it('should handle points with negative coordinates', () => {
            const points: number[][] = [
                [-10, -20, 0.4],
                [0, 0, 0.5],
                [10, 20, 0.6],
            ];
            const result = penPointsToPathLayer(points);
            expect(result).toEqual({
                type: LayerType.Path,
                x: -10,
                y: -20,
                width: 20, // 10 - (-10)
                height: 40, // 20 - (-20)
                points: [
                    [0, 0, 0.4],
                    [10, 20, 0.5],
                    [20, 40, 0.6],
                ],
            });
        });
    });

    describe('resizeBounds', () => {
        it('should resize bounds from the left corner', () => {
            const bounds: XYWH = { x: 50, y: 50, width: 100, height: 100 };
            const corner = Side.Left;
            const point: Point = { x: 30, y: 70 };

            const result = resizeBounds(bounds, corner, point);
            expect(result).toEqual({
                x: 30,
                y: 50,
                width: 120, // 50 + 100 - 30 = 120
                height: 100,
            });
        });

        it('should resize bounds from the right corner', () => {
            const bounds: XYWH = { x: 50, y: 50, width: 100, height: 100 };
            const corner = Side.Right;
            const point: Point = { x: 180, y: 70 };

            const result = resizeBounds(bounds, corner, point);
            expect(result).toEqual({
                x: 50,
                y: 50,
                width: 130, // 180 - 50 = 130
                height: 100,
            });
        });

        it('should resize bounds from the top corner', () => {
            const bounds: XYWH = { x: 50, y: 50, width: 100, height: 100 };
            const corner = Side.Top;
            const point: Point = { x: 70, y: 30 };

            const result = resizeBounds(bounds, corner, point);
            expect(result).toEqual({
                x: 50,
                y: 30,
                width: 100,
                height: 120, // 50 + 100 - 30 = 120
            });
        });

        it('should resize bounds from the bottom corner', () => {
            const bounds: XYWH = { x: 50, y: 50, width: 100, height: 100 };
            const corner = Side.Bottom;
            const point: Point = { x: 70, y: 180 };

            const result = resizeBounds(bounds, corner, point);
            expect(result).toEqual({
                x: 50,
                y: 50,
                width: 100,
                height: 130, // 180 - 50 = 130
            });
        });

        it('should resize bounds from multiple corners (Top-Left)', () => {
            const bounds: XYWH = { x: 50, y: 50, width: 100, height: 100 };
            const corner = Side.Top | Side.Left;
            const point: Point = { x: 30, y: 30 };

            const result = resizeBounds(bounds, corner, point);
            expect(result).toEqual({
                x: 30,
                y: 30,
                width: 120, // 50 + 100 - 30 = 120
                height: 120, // 50 + 100 - 30 = 120
            });
        });

        it('should resize bounds from multiple corners (Bottom-Right)', () => {
            const bounds: XYWH = { x: 50, y: 50, width: 100, height: 100 };
            const corner = Side.Bottom | Side.Right;
            const point: Point = { x: 180, y: 180 };

            const result = resizeBounds(bounds, corner, point);
            expect(result).toEqual({
                x: 50,
                y: 50,
                width: 130, // 180 - 50 = 130
                height: 130, // 180 - 50 = 130
            });
        });

        it('should handle points inside the original bounds', () => {
            const bounds: XYWH = { x: 50, y: 50, width: 100, height: 100 };
            const corner = Side.Left | Side.Top;
            const point: Point = { x: 60, y: 60 };

            const result = resizeBounds(bounds, corner, point);
            expect(result).toEqual({
                x: 60,
                y: 60,
                width: 90, // 50 + 100 - 60 = 90
                height: 90, // 50 + 100 - 60 = 90
            });
        });

        it('should handle points beyond the original bounds', () => {
            const bounds: XYWH = { x: 50, y: 50, width: 100, height: 100 };
            const corner = Side.Right | Side.Bottom;
            const point: Point = { x: 200, y: 200 };

            const result = resizeBounds(bounds, corner, point);
            expect(result).toEqual({
                x: 50,
                y: 50,
                width: 150, // 200 - 50 = 150
                height: 150, // 200 - 50 = 150
            });
        });

        it('should handle overlapping resizing (Left and Right)', () => {
            const bounds: XYWH = { x: 50, y: 50, width: 100, height: 100 };
            const corner = Side.Left | Side.Right;
            const point: Point = { x: 40, y: 60 };

            // Left:
            // x = min(40, 50 + 100) = 40
            // width = |50 + 100 - 40| = 110
            // Right:
            // x = min(40, 50) = 40
            // width = |50 - 40| = 10

            const result = resizeBounds(bounds, corner, point);
            expect(result).toEqual({
                x: 40,
                y: 50,
                width: 10,
                height: 100,
            });
        });
    });
});
