import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Canvas from './Canvas';
import { useCanvasStore } from '@/store/useCanvasStore';
import { LayerPreview } from './LayerPreview';
import '@testing-library/jest-dom';

jest.mock('@/store/useCanvasStore');

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
}));

describe('Canvas Component', () => {
    const mockUseCanvasStore = (mockLayerIds: string[]) => {
        (useCanvasStore as unknown as jest.Mock).mockImplementation(
            (selector) => selector({ layerIds: mockLayerIds }),
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (
            window as unknown as { PointerEvent: typeof MouseEvent }
        ).PointerEvent = MouseEvent;
    });

    it('renders without crashing', () => {
        mockUseCanvasStore([]);
        const { getByRole } = render(<Canvas />);
        expect(getByRole('main')).toBeInTheDocument();
    });

    it('renders the correct number of LayerPreview components', () => {
        const mockLayerIds = ['layer1', 'layer2', 'layer3'];
        mockUseCanvasStore(mockLayerIds);

        const { getAllByTestId } = render(<Canvas />);
        const layerPreviews = getAllByTestId(/layer-preview-/);
        expect(layerPreviews).toHaveLength(mockLayerIds.length);
    });

    it('should pan with pointer correctly', async () => {
        mockUseCanvasStore([]);
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
        mockUseCanvasStore([]);
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
        mockUseCanvasStore(mockLayerIds);

        const { getByTestId, rerender } = render(<Canvas />);

        const firstLayer = getByTestId('layer-preview-layer1');
        fireEvent.pointerDown(firstLayer);

        rerender(<Canvas />);

        expect(LayerPreview).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'layer1',
                selectionColor: 'blue',
            }),
            {},
        );

        const secondLayer = getByTestId('layer-preview-layer2');
        fireEvent.pointerDown(secondLayer);

        rerender(<Canvas />);

        expect(LayerPreview).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'layer2',
                selectionColor: 'blue',
            }),
            {},
        );
    });

    it('handles wheel events to adjust camera position and scale', async () => {
        mockUseCanvasStore([]);

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
        ); // 1 - 0.03 = 0.97

        const scaleFactor = newScale / initialScale; // 0.97 / 1 = 0.97
        const offsetX = 50; // Assuming clientX and clientY are 50
        const offsetY = 50;
        const newCameraX = offsetX - offsetX * scaleFactor; // 50 - 50 * 0.97 = 50 - 48.5 = 1.5
        const newCameraY = offsetY - offsetY * scaleFactor; // 50 - 50 * 0.97 = 1.5

        await waitFor(() => {
            // Using toBeCloseTo for floating point precision
            const transform = svgGroup.getAttribute('transform');
            expect(transform).toBe(
                `translate(${newCameraX}, ${newCameraY}) scale(${newScale})`,
            );
        });
    });
});
