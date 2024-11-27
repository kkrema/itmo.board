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
            state.layers.set(layer.id, layer);
            return { layerIds: [...state.layerIds, layer.id] };
        }),
    removeLayers: (ids: string[]) =>
        set((state) => {
            const idsSet = new Set(ids);
            idsSet.forEach((id) => state.layers.delete(id));
            return {
                layerIds: state.layerIds.filter((id) => !idsSet.has(id)),
            };
        }),
    updateLayer: (id: string, updates: Partial<Layer>) =>
        set((state) => {
            const layer = state.layers.get(id);
            if (layer) {
                const updatedLayer = { ...layer, ...updates };
                if (layer.type === updatedLayer.type) {
                    state.layers.set(id, updatedLayer as Layer);
                }
            }
            return {};
        }),
    getLayer: (id: string) => get().layers.get(id),
    getLayers: (ids: string[]) =>
        ids.map((id) => get().layers.get(id)).filter(Boolean) as Layer[],
    moveLayersToFront: (ids: string[]) =>
        set((state) => {
            const idsSet = new Set(ids);
            const layerIds = state.layerIds.filter((id) => !idsSet.has(id));
            return { layerIds: [...layerIds, ...ids] };
        }),

    moveLayersToBack: (ids: string[]) =>
        set((state) => {
            const idsSet = new Set(ids);
            const layerIds = state.layerIds.filter((id) => !idsSet.has(id));
            return { layerIds: [...ids, ...layerIds] };
        }),
    moveLayersForward: (ids: string[]) =>
        set((state) => {
            const idsSet = new Set(ids);
            const layerIds = [...state.layerIds];

            // From end to start
            for (let i = layerIds.length - 2; i >= 0; i--) {
                // last element = len - 1, next would be len
                if (idsSet.has(layerIds[i])) {
                    // Swap with next if not in selection
                    if (!idsSet.has(layerIds[i + 1])) {
                        [layerIds[i], layerIds[i + 1]] = [
                            layerIds[i + 1],
                            layerIds[i],
                        ];
                    }
                }
            }
            return { layerIds };
        }),

    moveLayersBackward: (ids: string[]) =>
        set((state) => {
            const idsSet = new Set(ids);
            const layerIds = [...state.layerIds];

            // From start to end
            for (let i = 1; i < layerIds.length; i++) {
                // 0 element is already at the back
                if (idsSet.has(layerIds[i])) {
                    if (!idsSet.has(layerIds[i - 1])) {
                        [layerIds[i], layerIds[i - 1]] = [
                            layerIds[i - 1],
                            layerIds[i],
                        ];
                    }
                }
            }
            return { layerIds };
        }),
}));

export const useCanvasStore = canvasStore;
