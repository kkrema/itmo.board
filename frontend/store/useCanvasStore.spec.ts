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

    const thirdLayer: Layer = {
        id: 'layer3',
        type: LayerType.Ellipse,
        x: 20,
        y: 30,
        width: 80,
        height: 80,
        fill: { r: 0, g: 0, b: 255 },
    };

    const fourthLayer: Layer = {
        id: 'layer4',
        type: LayerType.Note,
        x: 30,
        y: 40,
        width: 60,
        height: 60,
        fill: { r: 255, g: 255, b: 0 },
        value: 'Note',
    };

    const initializeStore = () => {
        const renderHookResult = renderHook(() => useCanvasStore());
        act(() => {
            renderHookResult.result.current.layers.clear();
            renderHookResult.result.current.layerIds = [];
        });
        return renderHookResult;
    };

    const addLayers = (
        result: { current: { addLayer: (arg0: Layer) => void } },
        layers: Layer[],
    ) => {
        act(() => {
            layers.forEach((layer) => result.current.addLayer(layer));
        });
    };

    const expectLayerOrder = (
        result: { current: { layerIds: string[] } },
        expectedOrder: string[],
    ) => {
        expect(result.current.layerIds).toEqual(expectedOrder);
    };

    beforeEach(() => {
        initializeStore();
    });

    it('adds a new layer', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer]);

        expect(result.current.layerIds).toContain(sampleLayer.id);
        expect(result.current.getLayer(sampleLayer.id)).toEqual(sampleLayer);
    });

    it('removes layers by ID', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer]);

        expect(result.current.layerIds).toHaveLength(2);

        act(() => {
            result.current.removeLayers([sampleLayer.id]);
        });

        expect(result.current.layerIds).toHaveLength(1);
        expect(result.current.layerIds).not.toContain(sampleLayer.id);
        expect(result.current.getLayer(sampleLayer.id)).toBeUndefined();
    });

    it('updates an existing layer', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer]);

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
        const { result } = initializeStore();

        act(() => {
            result.current.updateLayer('nonexistent', { x: 50 });
        });

        expect(result.current.getLayer('nonexistent')).toBeUndefined();
    });

    it('retrieves a single layer by ID', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer]);

        const retrievedLayer = result.current.getLayer(sampleLayer.id);
        expect(retrievedLayer).toEqual(sampleLayer);
    });

    it('retrieves multiple layers by IDs', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer]);

        const layers = result.current.getLayers([
            sampleLayer.id,
            anotherLayer.id,
        ]);
        expect(layers).toHaveLength(2);
        expect(layers).toContainEqual(sampleLayer);
        expect(layers).toContainEqual(anotherLayer);
    });

    it('returns an empty array for non-existent layer IDs', () => {
        const { result } = initializeStore();

        const layers = result.current.getLayers(['nonexistent']);
        expect(layers).toEqual([]);
    });

    it('maintains the correct order of layer IDs', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer]);

        expect(result.current.layerIds).toEqual([
            sampleLayer.id,
            anotherLayer.id,
        ]);
    });

    it('moves selected layers to the front', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer, thirdLayer]);

        act(() => {
            result.current.moveLayersToFront([sampleLayer.id]);
        });

        expectLayerOrder(result, [
            anotherLayer.id,
            thirdLayer.id,
            sampleLayer.id,
        ]);
    });

    it('moves selected layers to the back', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer, thirdLayer]);

        act(() => {
            result.current.moveLayersToBack([thirdLayer.id]);
        });

        expectLayerOrder(result, [
            thirdLayer.id,
            sampleLayer.id,
            anotherLayer.id,
        ]);
    });

    it('moves selected layers forward by one position', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer, thirdLayer]);

        act(() => {
            result.current.moveLayersForward([sampleLayer.id]);
        });

        expectLayerOrder(result, [
            anotherLayer.id,
            sampleLayer.id,
            thirdLayer.id,
        ]);
    });

    it('does not move layers forward if they are already at the top', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer]);

        act(() => {
            result.current.moveLayersForward([anotherLayer.id]);
        });

        expectLayerOrder(result, [sampleLayer.id, anotherLayer.id]);
    });

    it('moves selected layers backward by one position', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer, thirdLayer]);

        act(() => {
            result.current.moveLayersBackward([thirdLayer.id]);
        });

        expectLayerOrder(result, [
            sampleLayer.id,
            thirdLayer.id,
            anotherLayer.id,
        ]);
    });

    it('does not move layers backward if they are already at the bottom', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer]);

        act(() => {
            result.current.moveLayersBackward([sampleLayer.id]);
        });

        expectLayerOrder(result, [sampleLayer.id, anotherLayer.id]);
    });

    // Test moving multiple layers forward
    it('moves multiple selected layers forward together', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer, thirdLayer, fourthLayer]);

        act(() => {
            result.current.moveLayersForward([sampleLayer.id, anotherLayer.id]);
        });

        expectLayerOrder(result, [
            thirdLayer.id,
            sampleLayer.id,
            anotherLayer.id,
            fourthLayer.id,
        ]);
    });

    // Test moving multiple layers backward
    it('moves multiple selected layers backward together', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer, thirdLayer, fourthLayer]);

        act(() => {
            result.current.moveLayersBackward([thirdLayer.id, fourthLayer.id]);
        });

        expectLayerOrder(result, [
            sampleLayer.id,
            thirdLayer.id,
            fourthLayer.id,
            anotherLayer.id,
        ]);
    });

    // Test moving layers with overlapping selection
    it('maintains relative order when moving overlapping selections forward', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer, thirdLayer, fourthLayer]);

        act(() => {
            result.current.moveLayersForward([sampleLayer.id, thirdLayer.id]);
        });

        expectLayerOrder(result, [
            anotherLayer.id,
            sampleLayer.id,
            fourthLayer.id,
            thirdLayer.id,
        ]);
    });

    it('maintains relative order when moving overlapping selections backward', () => {
        const { result } = initializeStore();

        addLayers(result, [sampleLayer, anotherLayer, thirdLayer, fourthLayer]);

        act(() => {
            result.current.moveLayersBackward([anotherLayer.id, thirdLayer.id]);
        });

        expectLayerOrder(result, [
            anotherLayer.id,
            thirdLayer.id,
            sampleLayer.id,
            fourthLayer.id,
        ]);
    });
});
