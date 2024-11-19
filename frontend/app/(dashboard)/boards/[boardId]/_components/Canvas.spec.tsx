import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Canvas from './Canvas';
import { useCanvasStore } from '@/store/useCanvasStore';
import '@testing-library/jest-dom';
import { CanvasMode, CanvasState, LayerType } from '@/types/canvas';

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
    findIntersectingLayersWithRectangle: jest.fn(() => ['layer1', 'layer2']),
    penPointsToPathLayer: jest.fn((draft) => ({
        path: draft.map(([x, y]: [number, number]) => ({ x, y })),
    })),
    resizeBounds: jest.fn((initialBounds) => ({
        x: initialBounds.x,
        y: initialBounds.y,
        width: 150,
        height: 150,
    })),
}));

jest.mock('nanoid', () => ({
    nanoid: () => 'nanoid',
}));

jest.mock('@/app/(dashboard)/boards/[boardId]/_components/Toolbar', () => ({
    ToolBar: ({
        setCanvasState,
    }: {
        setCanvasState: (newState: CanvasState) => void;
    }) => (
        <div>
            <button
                data-testid="insert-rectangle-button"
                onClick={() =>
                    setCanvasState({
                        mode: CanvasMode.Inserting,
                        layerType: LayerType.Rectangle,
                    })
                }
            >
                Insert Rectangle
            </button>
            <button
                data-testid="pencil-tool-button"
                onClick={() => setCanvasState({ mode: CanvasMode.Pencil })}
            >
                Pencil Tool
            </button>
        </div>
    ),
}));

describe('Canvas Component', () => {
    const mockUseCanvasStore = (overrides = {}) => {
        const defaultStore = {
            layerIds: ['layer1', 'layer2'],
            addLayer: jest.fn(),
            updateLayer: jest.fn(),
            removeLayers: jest.fn(),
            getLayer: jest.fn((id) => ({ id })),
            getLayers: jest.fn(() => [
                { id: 'layer1', x: 0, y: 0 },
                { id: 'layer2', x: 50, y: 50 },
            ]),
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

    it('actions are ignored when editable is false', () => {
        const store = mockUseCanvasStore();

        const { getByTestId } = render(<Canvas edit={false} />);

        const insertButton = getByTestId('insert-rectangle-button');
        const pencilButton = getByTestId('pencil-tool-button');
        const svgElement = getByTestId('svg-element');
        const layer1 = getByTestId('layer-preview-layer1');
        const layer2 = getByTestId('layer-preview-layer2');

        // Attempt to insert a new rectangle layer
        fireEvent.click(insertButton);
        fireEvent.pointerUp(svgElement, {
            clientX: 100,
            clientY: 100,
        });
        expect(store.addLayer).not.toHaveBeenCalled();

        // Attempt to use the pencil tool to start drawing
        fireEvent.click(pencilButton);
        fireEvent.pointerDown(svgElement, {
            button: 0,
            clientX: 150,
            clientY: 150,
        });
        fireEvent.pointerMove(svgElement, {
            clientX: 160,
            clientY: 160,
        });
        fireEvent.pointerUp(svgElement);
        expect(store.addLayer).not.toHaveBeenCalled();

        // Attempt to translate a selected layer
        fireEvent.pointerDown(layer1, {
            button: 0,
            clientX: 200,
            clientY: 200,
        });
        fireEvent.pointerMove(svgElement, {
            clientX: 210,
            clientY: 210,
        });
        fireEvent.pointerUp(svgElement);
        expect(store.updateLayer).not.toHaveBeenCalled();

        // Attempt to start multi-selection with shift key
        fireEvent.pointerDown(svgElement, {
            button: 0,
            shiftKey: true,
            clientX: 300,
            clientY: 300,
        });
        fireEvent.pointerMove(svgElement, {
            clientX: 400,
            clientY: 400,
        });
        fireEvent.pointerUp(svgElement);
        expect(store.getLayers).not.toHaveBeenCalledWith(['layer1', 'layer2']);

        // Attempt to resize a layer
        // Note: Resizing typically involves specific handles; assuming pointer events simulate this
        fireEvent.pointerDown(layer2, {
            button: 0,
            clientX: 250,
            clientY: 250,
        });
        fireEvent.pointerMove(svgElement, {
            clientX: 300,
            clientY: 300,
        });
        fireEvent.pointerUp(svgElement);
        expect(store.updateLayer).not.toHaveBeenCalled();

        // Attempt to delete layers via keyboard
        fireEvent.keyDown(window, { key: 'Delete' });
        expect(store.removeLayers).not.toHaveBeenCalled();

        // Attempt to copy layers via keyboard
        fireEvent.keyDown(window, { key: 'c', ctrlKey: true });
        expect(store.getLayers).not.toHaveBeenCalled();

        // Attempt to paste layers via keyboard
        fireEvent.keyDown(window, { key: 'v', ctrlKey: true });
        expect(store.addLayer).not.toHaveBeenCalled();

        // Attempt to select all layers via keyboard
        fireEvent.keyDown(window, { key: 'a', ctrlKey: true });
        // Layers should not have border-color set to blue
        expect(layer1).not.toHaveStyle('border-color: blue');
        expect(layer2).not.toHaveStyle('border-color: blue');
    });

    it('renders the correct number of LayerPreview components', () => {
        const mockLayerIds = ['layer1', 'layer2', 'layer3'];
        // store IS being used
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const store = mockUseCanvasStore({
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
        // store IS being used
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const store = mockUseCanvasStore({
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

    it('actions ignored when editable is false', () => {});

    it('should insert a new layer on pointer up in inserting mode', () => {
        const addLayerMock = jest.fn();
        mockUseCanvasStore({
            addLayer: addLayerMock,
        });

        const { getByTestId } = render(<Canvas />);
        const insertButton = getByTestId('insert-rectangle-button');
        fireEvent.click(insertButton);

        const svgElement = getByTestId('svg-element');

        fireEvent.pointerDown(svgElement, {
            button: 0,
            clientX: 100,
            clientY: 100,
        });

        expect(addLayerMock).not.toHaveBeenCalled();

        fireEvent.pointerUp(svgElement, {
            clientX: 100,
            clientY: 100,
        });

        expect(addLayerMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'nanoid',
                type: LayerType.Rectangle,
                x: 100,
                y: 100,
                width: 100,
                height: 100,
                fill: { r: 0, g: 0, b: 0 },
            }),
        );
    });

    it('should translate selected layers when dragging', () => {
        const layerId = 'layer1';
        const initialLayer = { id: layerId, x: 50, y: 50 };
        const updateLayerMock = jest.fn();
        const getLayerMock = jest.fn(() => initialLayer);

        mockUseCanvasStore({
            layerIds: [layerId],
            getLayer: getLayerMock,
            updateLayer: updateLayerMock,
        });

        const { getByTestId } = render(<Canvas />);

        // Simulate selecting the layer
        const layerElement = getByTestId(`layer-preview-${layerId}`);
        fireEvent.pointerDown(layerElement, {
            button: 0,
            clientX: 100,
            clientY: 100,
        });

        // Simulate dragging
        const svgElement = getByTestId('svg-element');
        fireEvent.pointerMove(svgElement, {
            clientX: 110,
            clientY: 110,
        });

        fireEvent.pointerUp(svgElement);

        // Verify that updateLayer was called with new x and y
        expect(updateLayerMock).toHaveBeenCalledWith(layerId, {
            x: 60,
            y: 60,
        });
    });

    it('should update selection when drawing selection net', () => {
        const layerIds = ['layer1', 'layer2', 'layer3'];
        const getLayersMock = jest.fn(() =>
            layerIds.map((id) => ({ id, x: 0, y: 0 })),
        );

        mockUseCanvasStore({
            layerIds,
            getLayers: getLayersMock,
        });

        const { getByTestId } = render(<Canvas />);
        const svgElement = getByTestId('svg-element');

        // Simulate shift+pointer down to start selection net
        fireEvent.pointerDown(svgElement, {
            button: 0,
            shiftKey: true,
            clientX: 100,
            clientY: 100,
        });

        // Simulate pointer move to update selection net
        fireEvent.pointerMove(svgElement, {
            clientX: 200,
            clientY: 200,
        });

        // The mocked findIntersectingLayersWithRectangle returns ['layer1', 'layer2']
        // Check that layer1 and layer2 are selected
        ['layer1', 'layer2'].forEach((id) => {
            const layerElement = getByTestId(`layer-preview-${id}`);
            expect(layerElement).toHaveStyle('border-color: blue');
        });

        // Ensure layer3 is not selected
        const layerElement = getByTestId('layer-preview-layer3');
        expect(layerElement).not.toHaveStyle('border-color: blue');
    });

    it('should start and continue drawing with pencil tool', () => {
        mockUseCanvasStore();

        const { getByTestId } = render(<Canvas />);
        const pencilButton = getByTestId('pencil-tool-button');
        fireEvent.click(pencilButton);

        const svgElement = getByTestId('svg-element');

        // Start drawing
        fireEvent.pointerDown(svgElement, {
            button: 0,
            clientX: 100,
            clientY: 100,
        });

        // Continue drawing
        fireEvent.pointerMove(svgElement, {
            clientX: 110,
            clientY: 110,
        });
        fireEvent.pointerMove(svgElement, {
            clientX: 120,
            clientY: 120,
        });

        // Finish drawing
        fireEvent.pointerUp(svgElement);

        // Since insertPath adds a new layer, verify that addLayer is called
        const addLayerMock = useCanvasStore().addLayer;
        expect(addLayerMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'nanoid',
                type: LayerType.Path,
            }),
        );
    });

    it('should delete selected layers when pressing Delete key', () => {
        const layerId = 'layer1';
        const removeLayersMock = jest.fn();

        mockUseCanvasStore({
            layerIds: [layerId],
            removeLayers: removeLayersMock,
        });

        const { getByTestId } = render(<Canvas />);

        // Simulate selecting the layer
        const layerElement = getByTestId(`layer-preview-${layerId}`);
        fireEvent.pointerDown(layerElement, {
            button: 0,
            clientX: 100,
            clientY: 100,
        });

        fireEvent.keyDown(window, { key: 'Delete' });

        expect(removeLayersMock).toHaveBeenCalledWith([layerId]);
    });

    it('should copy and paste selected layers', () => {
        const layerId = 'layer1';
        const layerData = { id: layerId, x: 50, y: 50 };
        const addLayerMock = jest.fn();
        const getLayersMock = jest.fn(() => [layerData]);

        mockUseCanvasStore({
            layerIds: [layerId],
            getLayers: getLayersMock,
            addLayer: addLayerMock,
        });

        const { getByTestId } = render(<Canvas />);

        // Simulate selecting the layer
        const layerElement = getByTestId(`layer-preview-${layerId}`);
        fireEvent.pointerDown(layerElement, {
            button: 0,
            clientX: 100,
            clientY: 100,
        });

        // Ctrl+C
        fireEvent.keyDown(window, { key: 'c', ctrlKey: true });

        // Ctrl+V
        fireEvent.keyDown(window, { key: 'v', ctrlKey: true });

        // Verify that addLayer is called with copied layer
        expect(addLayerMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'nanoid',
                x: 60,
                y: 60,
            }),
        );

        fireEvent.keyDown(window, { key: 'c', metaKey: true });
        fireEvent.keyDown(window, { key: 'v', metaKey: true });

        // Verify that addLayer is called with copied layer
        expect(addLayerMock).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'nanoid',
                x: 60,
                y: 60,
            }),
        );

        // Verify that addLayer is called twice
        expect(addLayerMock).toHaveBeenCalledTimes(2);
    });

    it('should select all layers when pressing Ctrl+A', () => {
        const layerIds = ['layer1', 'layer2', 'layer3'];

        mockUseCanvasStore({
            layerIds,
        });

        const { getByTestId } = render(<Canvas />);

        // Ctrl+A
        fireEvent.keyDown(window, { key: 'a', ctrlKey: true });

        // Verify that all layers are selected
        layerIds.forEach((id) => {
            const layerElement = getByTestId(`layer-preview-${id}`);
            expect(layerElement).toHaveStyle('border-color: blue');
        });
    });

    it('should select all layers when pressing Meta+A', () => {
        const layerIds = ['layer1', 'layer2', 'layer3'];

        mockUseCanvasStore({
            layerIds,
        });

        const { getByTestId } = render(<Canvas />);

        // Ctrl+A
        fireEvent.keyDown(window, { key: 'a', metaKey: true });

        // Verify that all layers are selected
        layerIds.forEach((id) => {
            const layerElement = getByTestId(`layer-preview-${id}`);
            expect(layerElement).toHaveStyle('border-color: blue');
        });
    });

    it('should stop panning when pointer leaves the canvas', () => {
        mockUseCanvasStore();
        const { getByTestId } = render(<Canvas />);
        const svgElement = getByTestId('svg-element');

        // Simulate pointer down to start panning
        fireEvent.pointerDown(svgElement, {
            button: 0,
            clientX: 100,
            clientY: 100,
        });

        // Simulate pointer leave
        fireEvent.pointerLeave(svgElement);

        // Simulate pointer move (should not pan since pointer has left)
        fireEvent.pointerMove(svgElement, {
            clientX: 110,
            clientY: 110,
        });

        const svgGroup = getByTestId('svg-group');
        expect(svgGroup.getAttribute('transform')).toBe(
            'translate(0, 0) scale(1)',
        );
    });
});
