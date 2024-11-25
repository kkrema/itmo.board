import { renderHook } from '@testing-library/react';

import { Layer, LayerType, XYWH } from '@/types/canvas';
import { useSelectionBounds } from '@/hooks/useSelectionBounds';

const mockLayers: Layer[] = [
    {
        id: '1',
        type: LayerType.Rectangle,
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: { r: 0, g: 0, b: 255 },
    },
    {
        id: '2',
        type: LayerType.Rectangle,
        x: 30,
        y: 40,
        width: 80,
        height: 60,
        fill: { r: 255, g: 0, b: 0 },
    },
    {
        id: '3',
        type: LayerType.Rectangle,
        x: 50,
        y: 60,
        width: 90,
        height: 100,
        fill: { r: 0, g: 255, b: 0 },
    },
];

const mockMap = new Map<string, Layer>(
    mockLayers.map((layer) => [layer.id, layer]),
);

jest.mock('@/store/useCanvasStore', () => ({
    useCanvasStore: jest.fn().mockImplementation(() => ({
        layers: mockMap,
        layerIds: mockLayers.map((layer) => layer.id),
        addLayer: jest.fn(),
        removeLayers: jest.fn(),
        updateLayer: jest.fn(),
        getLayer: (id: string) => mockMap.get(id),
        getLayers: (ids: string[]) =>
            ids.map((id) => mockMap.get(id)!).filter(Boolean) as Layer[],
    })),
}));

describe('SelectionBox Component', () => {
    test('useSelectionBounds returns correct bounds', () => {
        const selection = ['1', '2'];
        const layersMap = new Map<string, Layer>(
            mockLayers.map((layer) => [layer.id, layer]),
        );

        const { result } = renderHook(() =>
            useSelectionBounds({ selection, layers: layersMap }),
        );

        const expectedBounds: XYWH = {
            x: 10,
            y: 20,
            width: 100,
            height: 80,
        };

        expect(result.current).toEqual(expectedBounds);
    });
});
