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
            return { layers, layerIds: state.layerIds.filter((id) => !ids.includes(id)) };
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
}));

export const useCanvasStore = canvasStore;
