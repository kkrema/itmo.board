import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { useCanvasStore } from '@/store/useCanvasStore';
import '@testing-library/jest-dom';
import Canvas from './Canvas';
import {findIntersectingLayersWithRectangle} from "@/lib/utils";

jest.mock('@/store/useCanvasStore', () => ({
    useCanvasStore: jest.fn(),
}));

jest.mock('./LayerPreview', () => ({
    LayerPreview: jest.fn(({ onLayerPointerDown, selectionColor, id }) => (
        <div
            data-testid={`layer-preview-${id}`}
            onPointerDown={(e) => onLayerPointerDown(e, id)}
            style={{ borderColor: selectionColor }}
        >
            LayerPreview {id}
        </div>
    )),
}));

jest.mock('@/lib/utils', () => ({
    cn: (...args: string[]) => args.filter(Boolean).join(' '),
    pointerEventToCanvasPoint: jest.fn((e, camera, scale) => ({
        x: (e.clientX - camera.x) / scale,
        y: (e.clientY - camera.y) / scale,
    })),
    findIntersectingLayersWithRectangle: jest.fn(() => []),
    penPointsToPathLayer: jest.fn((draft: [number, number][]) => ({
        path: draft.map(([x, y]: [number, number]) => ({ x, y })),
    })),
    resizeBounds: jest.fn(
        (
            initialBounds: {
                x: number;
                y: number;
                width: number;
                height: number;
            },
            corner: string, // eslint-disable-line @typescript-eslint/no-unused-vars
            currentPoint: { x: number; y: number }, // eslint-disable-line @typescript-eslint/no-unused-vars
        ) => ({
            x: initialBounds.x,
            y: initialBounds.y,
            width: 100,
            height: 100,
        }),
    ),
}));

jest.mock('nanoid', () => ({
    nanoid: () => 'nanoid',
}));

describe('Canvas Component', () => {
    const mockUseCanvasStore = (overrides = {}) => {
        const defaultStore = {
            layerIds: [],
            addLayer: jest.fn(),
            updateLayer: jest.fn(),
            removeLayers: jest.fn(),
            getLayer: jest.fn(),
            getLayers: jest.fn(),
        };

        const store = { ...defaultStore, ...overrides };

        (useCanvasStore as unknown as jest.Mock).mockImplementation(
            () => store,
        );

        return store;
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (
            window as unknown as { PointerEvent: typeof MouseEvent }
        ).PointerEvent = MouseEvent;
    });

    it('renders without crashing', () => {
        mockUseCanvasStore();
        const { getByRole } = render(<Canvas />);
        expect(getByRole('main')).toBeInTheDocument();
    });

    it('renders the correct number of LayerPreview components', () => {
        const mockLayerIds = ['layer1', 'layer2', 'layer3'];
        mockUseCanvasStore({
            layerIds: mockLayerIds,
            getLayer: jest.fn((id) => ({ id })),
            getLayers: jest.fn(() => mockLayerIds.map((id) => ({ id }))),
        });

        const { getAllByTestId } = render(<Canvas />);
        const layerPreviews = getAllByTestId(/layer-preview-/);
        expect(layerPreviews).toHaveLength(mockLayerIds.length);
    });

    it('should pan with pointer correctly', async () => {
        mockUseCanvasStore();
        const { getByTestId } = render(<Canvas />);
        const svgElement = getByTestId('svg-element');
        const svgGroup = getByTestId('svg-group');

        // Verify initial camera position
        expect(svgGroup.getAttribute('transform')).toBe(
            'translate(0, 0) scale(1)',
        );

        fireEvent.pointerDown(svgElement, {
            button: 0,
            clientX: 100,
            clientY: 100,
        });
        fireEvent.pointerMove(svgElement, { clientX: 110, clientY: 120 });
        fireEvent.pointerUp(svgElement);

        expect(svgGroup.getAttribute('transform')).toBe(
            'translate(10, 20) scale(1)',
        );
    });

    it('should accumulate multiple panning actions correctly', async () => {
        mockUseCanvasStore();
        const { getByTestId } = render(<Canvas />);
        const svgElement = getByTestId('svg-element');
        const svgGroup = getByTestId('svg-group');

        expect(svgGroup.getAttribute('transform')).toBe(
            'translate(0, 0) scale(1)',
        );

        // First panning action: move by (15, 25)
        fireEvent.pointerDown(svgElement, {
            button: 0,
            clientX: 200,
            clientY: 200,
        });
        fireEvent.pointerMove(svgElement, { clientX: 215, clientY: 225 });
        fireEvent.pointerUp(svgElement);

        expect(svgGroup.getAttribute('transform')).toBe(
            'translate(15, 25) scale(1)',
        );

        // Second panning action: move by (-5, -10)
        fireEvent.pointerDown(svgElement, {
            button: 0,
            clientX: 215,
            clientY: 225,
        });
        fireEvent.pointerMove(svgElement, { clientX: 210, clientY: 215 });
        fireEvent.pointerUp(svgElement);

        expect(svgGroup.getAttribute('transform')).toBe(
            'translate(10, 15) scale(1)',
        );
    });

    it('toggles layer selection on layer click', () => {
        const mockLayerIds = ['layer1', 'layer2'];
        mockUseCanvasStore({
            layerIds: mockLayerIds,
            getLayer: jest.fn((id) => ({ id })),
        });

        const { getByTestId } = render(<Canvas />);

        const firstLayer = getByTestId('layer-preview-layer1');
        fireEvent.pointerDown(firstLayer);

        expect(firstLayer).toHaveStyle('border-color: blue');

        const secondLayer = getByTestId('layer-preview-layer2');
        fireEvent.pointerDown(secondLayer);

        expect(secondLayer).toHaveStyle('border-color: blue');
    });

    it('handles wheel events to adjust camera position and scale', async () => {
        mockUseCanvasStore();

        const { getByTestId } = render(<Canvas />);
        const svgElement = getByTestId('svg-element');
        const svgGroup = getByTestId('svg-group');

        // Initial transform
        expect(svgGroup.getAttribute('transform')).toBe(
            'translate(0, 0) scale(1)',
        );

        // Simulate wheel event
        fireEvent.wheel(svgElement, {
            deltaX: 20,
            deltaY: 30,
            clientX: 50,
            clientY: 50,
        });

        // Calculate expected new scale and camera position based on the component's onWheel logic
        const zoomIntensity = 0.001;
        const initialScale = 1;
        const deltaY = 30;
        const newScale = Math.min(
            Math.max(initialScale - deltaY * zoomIntensity, 0.1),
            20,
        ); // 0.97
        const scaleFactor = newScale / initialScale; // 0.97
        const offsetX = 50;
        const offsetY = 50;
        const newCameraX = offsetX - offsetX * scaleFactor; // 50 - 50 * 0.97 = 50 - 48.5 = 1.5
        const newCameraY = offsetY - offsetY * scaleFactor; // 50 - 50 * 0.97 = 1.5

        await waitFor(() => {
            const transform = svgGroup.getAttribute('transform');
            expect(transform).toBe(
                `translate(${newCameraX}, ${newCameraY}) scale(${newScale})`,
            );
        });
    });

    it('handles onPointerUp for different canvas modes', () => {
        const addLayerMock = jest.fn();
        const updateLayerMock = jest.fn();
        const mockLayerIds = ['layer1'];
        mockUseCanvasStore({
            layerIds: mockLayerIds,
            addLayer: addLayerMock,
            updateLayer: updateLayerMock,
        });

        const { getByTestId } = render(<Canvas />);
        const svgElement = getByTestId('svg-element');

        fireEvent.pointerDown(svgElement, { clientX: 100, clientY: 100 });
        fireEvent.pointerUp(svgElement);

        expect(addLayerMock).not.toHaveBeenCalled();

        fireEvent.pointerDown(svgElement, { clientX: 150, clientY: 150 });
        fireEvent.pointerUp(svgElement);

        expect(addLayerMock).not.toHaveBeenCalled();

        fireEvent.pointerDown(svgElement, {});
    });

    it('updates selection on layer click', () => {
        const mockLayerIds = ['layer1', 'layer2'];
        mockUseCanvasStore({
            layerIds: mockLayerIds,
            getLayer: jest.fn((id) => ({ id })),
        });

        const { getByTestId } = render(<Canvas />);

        const firstLayer = getByTestId('layer-preview-layer1');
        fireEvent.pointerDown(firstLayer);

        expect(firstLayer).toHaveStyle('border-color: blue');
    });

    it('handles keyboard shortcuts for delete, copy, and paste', async () => {
        const mockLayerIds = ['layer1'];
        const removeLayersMock = jest.fn();
        const addLayerMock = jest.fn();
        let selectionState: never[] = [];

        const mockSetSelection = jest.fn((newSelection) => {
            selectionState = newSelection;
        });

        mockUseCanvasStore({
            layerIds: mockLayerIds,
            getLayers: jest.fn(() => mockLayerIds.map((id) => ({ id }))),
            removeLayers: removeLayersMock,
            addLayer: addLayerMock,
            setSelection: mockSetSelection,
        });

        const { getByTestId } = render(<Canvas />);
        const svgElement = getByTestId('svg-element');

        fireEvent.pointerDown(svgElement, { button: 0, clientX: 100, clientY: 100 });
        fireEvent.pointerUp(svgElement);

        fireEvent.keyDown(window, { key: 'Delete' });
        await waitFor(() => {
            expect(removeLayersMock).toHaveBeenCalledWith(selectionState);
        });

        fireEvent.keyDown(window, { key: 'c', ctrlKey: true });
        expect(addLayerMock).not.toHaveBeenCalled();

        fireEvent.keyDown(window, { key: 'v', ctrlKey: true });
        await waitFor(() => {
            expect(addLayerMock).toHaveBeenCalled();
        });
    });

    it('handles multi-selection with Selection Net', async () => {
        const mockLayerIds = ['layer1', 'layer2', 'layer3'];
        const mockLayers = mockLayerIds.map((id) => ({ id }));

        const mockFindIntersectingLayersWithRectangle = findIntersectingLayersWithRectangle as jest.MockedFunction<
            typeof findIntersectingLayersWithRectangle
        >;

        mockFindIntersectingLayersWithRectangle.mockImplementation(() => ['layer1', 'layer2']);

        mockUseCanvasStore({
            layerIds: mockLayerIds,
            getLayers: jest.fn(() => mockLayers),
        });

        const { getByTestId } = render(<Canvas />);
        const svgElement = getByTestId('svg-element');

        fireEvent.pointerDown(svgElement, { clientX: 100, clientY: 100, shiftKey: true });

        fireEvent.pointerMove(svgElement, { clientX: 200, clientY: 200 });

        fireEvent.pointerUp(svgElement);

        expect(mockFindIntersectingLayersWithRectangle).toHaveBeenCalledWith(
            mockLayerIds,
            expect.any(Map),
            expect.any(Object),
            expect.any(Object)
        );

        expect(mockFindIntersectingLayersWithRectangle).toHaveReturnedWith(['layer1', 'layer2']);
    });
});
