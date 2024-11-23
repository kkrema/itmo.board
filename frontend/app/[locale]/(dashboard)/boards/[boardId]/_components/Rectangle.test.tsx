import React from 'react';
import { render } from '@testing-library/react';
import { Rectangle } from './Rectangle';
import { LayerType, RectangleLayer } from '@/types/canvas';
import '@testing-library/jest-dom';

const mockLayer: RectangleLayer = {
    id: '1',
    type: LayerType.Rectangle,
    x: 10,
    y: 20,
    width: 100,
    height: 50,
    fill: { r: 255, g: 255, b: 255 },
};

const mockOnPointerDown = jest.fn();

test('renders rectangle with correct props', () => {
    const { container } = render(
        <Rectangle
            id="1"
            layer={mockLayer}
            onPointerDown={mockOnPointerDown}
            selectionColor="blue"
        />,
    );

    const rectElement = container.querySelector('rect');
    expect(rectElement).toHaveAttribute('x', '0');
    expect(rectElement).toHaveAttribute('y', '0');
    expect(rectElement).toHaveAttribute('width', '100');
    expect(rectElement).toHaveAttribute('height', '50');
    expect(rectElement).toHaveStyle('transform: translate(10px, 20px)');
    expect(rectElement).toHaveAttribute('fill', '#ffffff');
    expect(rectElement).toHaveAttribute('stroke', 'blue');
});
