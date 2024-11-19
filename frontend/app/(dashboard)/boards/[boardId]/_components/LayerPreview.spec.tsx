import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayerPreview } from './LayerPreview';
import { LayerType } from '@/types/canvas';
import { useCanvasStore } from '@/store/useCanvasStore';
import '@testing-library/jest-dom';

jest.mock('@/store/useCanvasStore', () => ({
    useCanvasStore: jest.fn(),
}));

jest.mock('./Path', () => ({
    Path: jest.fn(({ onPointerDown }) => (
        <svg data-testid="path-element" onPointerDown={onPointerDown} />
    )),
}));

describe('LayerPreview Component', () => {
    const mockGetLayer = jest.fn();
    const mockOnLayerPointerDown = jest.fn();

    const mockLayer = {
        id: 'layer1',
        type: LayerType.Path,
        points: [
            [0, 0],
            [10, 10],
        ],
        x: 100,
        y: 200,
        fill: { r: 255, g: 0, b: 0, a: 1 },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useCanvasStore as unknown as jest.Mock).mockImplementation(
            (callback) => {
                return callback({
                    getLayer: mockGetLayer,
                });
            },
        );
    });

    test('renders Path component when layer type is Path', () => {
        mockGetLayer.mockReturnValue(mockLayer);

        render(
            <LayerPreview
                id="layer1"
                onLayerPointerDown={mockOnLayerPointerDown}
                selectionColor="#00FF00"
            />,
        );

        const pathElement = screen.getByTestId('path-element');
        expect(pathElement).toBeInTheDocument();
    });

    test('passes correct props to Path component', () => {
        mockGetLayer.mockReturnValue(mockLayer);

        render(
            <LayerPreview
                id="layer1"
                onLayerPointerDown={mockOnLayerPointerDown}
                selectionColor="#00FF00"
            />,
        );

        const pathElement = screen.getByTestId('path-element');

        // Simulate pointer down event
        fireEvent.pointerDown(pathElement);

        // Check that onLayerPointerDown was called
        expect(mockOnLayerPointerDown).toHaveBeenCalledTimes(1);
        expect(mockOnLayerPointerDown).toHaveBeenCalledWith(
            expect.any(Object),
            'layer1',
        );
    });

    test('renders null if layer is not found', () => {
        mockGetLayer.mockReturnValue(null);

        const { container } = render(
            <LayerPreview
                id="non-existent-layer"
                onLayerPointerDown={mockOnLayerPointerDown}
                selectionColor="#00FF00"
            />,
        );

        expect(container.firstChild).toBeNull();
    });

    test('renders null and logs a warning for unknown layer type', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        mockGetLayer.mockReturnValue({
            ...mockLayer,
            type: 'UnknownType',
        });

        const { container } = render(
            <LayerPreview
                id="unknown-layer"
                onLayerPointerDown={mockOnLayerPointerDown}
                selectionColor="#00FF00"
            />,
        );

        expect(container.firstChild).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown layer type');
        consoleWarnSpy.mockRestore();
    });
});
