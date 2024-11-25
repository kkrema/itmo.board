import { renderHook } from '@testing-library/react';
import { useSelectionBounds } from './useSelectionBounds';
import { Layer, LayerType, XYWH } from '@/types/canvas';

describe('useSelectionBounds', () => {
    const createMockLayer = (id: string, x: number, y: number, width: number, height: number): Layer => ({
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

    test('should return null if no layers are selected', () => {
        const { result } = renderHook(() => useSelectionBounds({ selection: [], layers }));

        expect(result.current).toBeNull();
    });

    test('should update bounding box when selection changes', () => {
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

    test('should return null when a selected layer does not exist', () => {
        const { result } = renderHook(() => useSelectionBounds({ selection: ['nonexistent'], layers }));

        expect(result.current).toBeNull();
    });

    test('should adjust left and top when a layer has smaller x and y', () => {
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
});
