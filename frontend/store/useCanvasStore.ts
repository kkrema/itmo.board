import { Layer } from '@/types/canvas';
import { create } from 'zustand';

type CanvasStore = {
    layers: Map<string, Layer>;
    layerIds: string[];
    addLayer: (layer: Layer) => void;
    getLayer: (id: string) => Layer | undefined;
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
    getLayer: (id: string) => get().layers.get(id),
}));

export const useCanvasStore = canvasStore;
