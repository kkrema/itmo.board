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
        (useCanvasStore as unknown as jest.Mock).mockImplementation((selector) =>
            selector({ layerIds: mockLayerIds })
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
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
            {}
        );

        const secondLayer = getByTestId('layer-preview-layer2');
        fireEvent.pointerDown(secondLayer);

        rerender(<Canvas />);

        expect(LayerPreview).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'layer2',
                selectionColor: 'blue',
            }),
            {}
        );
    });

    it('handles wheel events to adjust camera position', () => {
        mockUseCanvasStore([]);

        const { getByTestId } = render(<Canvas />);
        const svgElement = getByTestId('svg-element');

        fireEvent.wheel(svgElement, { deltaX: 20, deltaY: 30 });

        const gElement = svgElement.querySelector('g');
        expect(gElement).toHaveStyle('transform: translate(-20px, -30px)');
    });
});
