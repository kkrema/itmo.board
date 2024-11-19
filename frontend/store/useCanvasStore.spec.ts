import { renderHook, act } from '@testing-library/react';
import { useCanvasStore } from './useCanvasStore';
import { Layer, LayerType } from '@/types/canvas';

describe('useCanvasStore', () => {
    const sampleLayer: Layer = {
        id: 'layer1',
        type: LayerType.Rectangle,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        fill: { r: 255, g: 0, b: 0 },
    };

    const anotherLayer: Layer = {
        id: 'layer2',
        type: LayerType.Path,
        x: 10,
        y: 20,
        width: 50,
        height: 50,
        fill: { r: 0, g: 255, b: 0 },
        points: [
            [0, 0],
            [10, 10],
        ],
    };

    beforeEach(() => {
        const { result } = renderHook(() => useCanvasStore());
        act(() => {
            result.current.layers.clear();
            result.current.layerIds = [];
        });
    });

    it('adds a new layer', () => {
        const { result } = renderHook(() => useCanvasStore());

        act(() => {
            result.current.addLayer(sampleLayer);
        });

        expect(result.current.layerIds).toContain(sampleLayer.id);
        expect(result.current.getLayer(sampleLayer.id)).toEqual(sampleLayer);
    });

    it('removes layers by ID', () => {
        const { result } = renderHook(() => useCanvasStore());

        act(() => {
            result.current.addLayer(sampleLayer);
            result.current.addLayer(anotherLayer);
        });

        expect(result.current.layerIds).toHaveLength(2);

        act(() => {
            result.current.removeLayers([sampleLayer.id]);
        });

        expect(result.current.layerIds).toHaveLength(1);
        expect(result.current.layerIds).not.toContain(sampleLayer.id);
        expect(result.current.getLayer(sampleLayer.id)).toBeUndefined();
    });

    it('updates an existing layer', () => {
        const { result } = renderHook(() => useCanvasStore());

        act(() => {
            result.current.addLayer(sampleLayer);
        });

        const updates = { x: 50, y: 50, width: 200 };

        act(() => {
            result.current.updateLayer(sampleLayer.id, updates);
        });

        const updatedLayer = result.current.getLayer(sampleLayer.id);
        expect(updatedLayer).toBeDefined();
        expect(updatedLayer?.x).toBe(updates.x);
        expect(updatedLayer?.y).toBe(updates.y);
        expect(updatedLayer?.width).toBe(updates.width);
        expect(updatedLayer?.height).toBe(sampleLayer.height); // Unchanged property
    });

    it('does not update non-existing layer', () => {
        const { result } = renderHook(() => useCanvasStore());

        act(() => {
            result.current.updateLayer('nonexistent', { x: 50 });
        });

        expect(result.current.getLayer('nonexistent')).toBeUndefined();
    });

    it('retrieves a single layer by ID', () => {
        const { result } = renderHook(() => useCanvasStore());

        act(() => {
            result.current.addLayer(sampleLayer);
        });

        const retrievedLayer = result.current.getLayer(sampleLayer.id);
        expect(retrievedLayer).toEqual(sampleLayer);
    });

    it('retrieves multiple layers by IDs', () => {
        const { result } = renderHook(() => useCanvasStore());

        act(() => {
            result.current.addLayer(sampleLayer);
            result.current.addLayer(anotherLayer);
        });

        const layers = result.current.getLayers([sampleLayer.id, anotherLayer.id]);
        expect(layers).toHaveLength(2);
        expect(layers).toContainEqual(sampleLayer);
        expect(layers).toContainEqual(anotherLayer);
    });

    it('returns an empty array for non-existent layer IDs', () => {
        const { result } = renderHook(() => useCanvasStore());

        const layers = result.current.getLayers(['nonexistent']);
        expect(layers).toEqual([]);
    });

    it('maintains the correct order of layer IDs', () => {
        const { result } = renderHook(() => useCanvasStore());

        act(() => {
            result.current.addLayer(sampleLayer);
            result.current.addLayer(anotherLayer);
        });

        expect(result.current.layerIds).toEqual([sampleLayer.id, anotherLayer.id]);
    });
});