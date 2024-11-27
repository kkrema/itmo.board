import { Layer } from '@/types/canvas';
import { create } from 'zustand';

type CanvasStore = {
    layers: Map<string, Layer>;
    layerIds: string[];
    addLayer: (layer: Layer) => void;
    removeLayers: (ids: string[]) => void;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    getLayer: (id: string) => Layer | undefined;
    getLayers: (ids: string[]) => Layer[];
    moveLayersToFront: (ids: string[]) => void;
    moveLayersToBack: (ids: string[]) => void;
    moveLayersForward: (ids: string[]) => void;
    moveLayersBackward: (ids: string[]) => void;
};

const canvasStore = create<CanvasStore>((set, get) => ({
    layers: new Map<string, Layer>(),
    layerIds: [],
    addLayer: (layer: Layer) =>
        set((state) => {
            const layers = new Map(state.layers);
            layers.set(layer.id, layer);
            return { layers, layerIds: [...state.layerIds, layer.id] };
        }),
    removeLayers: (ids: string[]) =>
        set((state) => {
            const layers = new Map(state.layers);
            ids.forEach((id) => layers.delete(id));
            return {
                layers,
                layerIds: state.layerIds.filter((id) => !ids.includes(id)),
            };
        }),
    updateLayer: (id: string, updates: Partial<Layer>) =>
        set((state) => {
            const layers = new Map(state.layers);
            const layer = layers.get(id);
            if (layer) {
                const updatedLayer = { ...layer, ...updates };
                if (layer.type === updatedLayer.type) {
                    layers.set(id, updatedLayer as Layer);
                }
            }
            return { layers };
        }),
    getLayer: (id: string) => get().layers.get(id),
    getLayers: (ids: string[]) =>
        ids.map((id) => get().layers.get(id)).filter(Boolean) as Layer[],
    moveLayersToFront: (ids: string[]) =>
        set((state) => {
            const layerIds = state.layerIds.filter((id) => !ids.includes(id));
            return { layerIds: [...layerIds, ...ids] };
        }),

    moveLayersToBack: (ids: string[]) =>
        set((state) => {
            const layerIds = state.layerIds.filter((id) => !ids.includes(id));
            return { layerIds: [...ids, ...layerIds] };
        }),
    moveLayersForward: (ids: string[]) =>
        set((state) => {
            const layerIds = [...state.layerIds];
            const idToIndex = new Map(layerIds.map((id, index) => [id, index]));
            // Indices of selected layers
            const selectedIndices = ids
                .map((id) => idToIndex.get(id))
                .filter((index) => index !== undefined) as number[];

            // Descending sort
            selectedIndices.sort((a, b) => b - a);

            selectedIndices.forEach((index) => {
                if (index < layerIds.length - 1) {
                    const nextIndex = index + 1;
                    [layerIds[index], layerIds[nextIndex]] = [
                        layerIds[nextIndex],
                        layerIds[index],
                    ];
                }
            });

            return { layerIds };
        }),

    moveLayersBackward: (ids: string[]) =>
        set((state) => {
            const layerIds = [...state.layerIds];
            const idToIndex = new Map(layerIds.map((id, index) => [id, index]));
            const selectedIndices = ids
                .map((id) => idToIndex.get(id))
                .filter((index) => index !== undefined) as number[];

            // Ascending sort
            selectedIndices.sort((a, b) => a - b);

            selectedIndices.forEach((index) => {
                if (index > 0) {
                    const prevIndex = index - 1;
                    [layerIds[index], layerIds[prevIndex]] = [
                        layerIds[prevIndex],
                        layerIds[index],
                    ];
                }
            });

            return { layerIds };
        }),
}));

export const useCanvasStore = canvasStore;
