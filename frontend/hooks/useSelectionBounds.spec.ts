import { renderHook } from '@testing-library/react';
import { useSelectionBounds } from './useSelectionBounds';
import { Layer, LayerType, XYWH } from '@/types/canvas';

describe('useSelectionBounds', () => {
    const createMockLayer = (
        id: string,
        x: number,
        y: number,
        width: number,
        height: number,
    ): Layer => ({
        id,
        type: LayerType.Rectangle,
        x,
        y,
        width,
        height,
        fill: { r: 255, g: 255, b: 255 },
    });

    let layers: Map<string, Layer>;

    beforeEach(() => {
        layers = new Map();
        layers.set('1', createMockLayer('1', 10, 20, 100, 50));
        layers.set('2', createMockLayer('2', 30, 40, 80, 60));
        layers.set('3', createMockLayer('3', 50, 60, 90, 100));
    });

    describe('when no layers are selected', () => {
        test('should return null', () => {
            const { result } = renderHook(() =>
                useSelectionBounds({ selection: [], layers })
            );
            expect(result.current).toBeNull();
        });
    });

    describe('when selection changes', () => {
        test('should update bounding box correctly', () => {
            const { result, rerender } = renderHook(
                ({ selection }) => useSelectionBounds({ selection, layers }),
                {
                    initialProps: { selection: ['1'], layers },
                }
            );

            const expectedBoundsBeforeChange: XYWH = {
                x: 10,
                y: 20,
                width: 100,
                height: 50,
            };
            expect(result.current).toEqual(expectedBoundsBeforeChange);

            rerender({ selection: ['2', '3'], layers });

            const expectedBoundsAfterChange: XYWH = {
                x: 30,
                y: 40,
                width: 110,
                height: 120,
            };
            expect(result.current).toEqual(expectedBoundsAfterChange);
        });
    });

    describe('when selected layer does not exist', () => {
        test('should return null', () => {
            const { result } = renderHook(() =>
                useSelectionBounds({ selection: ['nonexistent'], layers })
            );
            expect(result.current).toBeNull();
        });
    });

    describe('when layers have different positions', () => {
        test('should adjust left and top correctly', () => {
            layers.set('4', createMockLayer('4', 5, 15, 80, 60));
            const { result } = renderHook(
                ({ selection }) => useSelectionBounds({ selection, layers }),
                {
                    initialProps: { selection: ['1', '4'], layers },
                }
            );

            const expectedBounds: XYWH = { x: 5, y: 15, width: 105, height: 60 };
            expect(result.current).toEqual(expectedBounds);
        });

        test('should return bounding box when layers do not overlap', () => {
            layers.set('5', createMockLayer('5', 200, 200, 50, 50));
            const { result } = renderHook(
                ({ selection }) => useSelectionBounds({ selection, layers }),
                {
                    initialProps: { selection: ['1', '5'], layers },
                }
            );

            const expectedBounds: XYWH = { x: 10, y: 20, width: 240, height: 230 };
            expect(result.current).toEqual(expectedBounds);
        });
    });
});
