import React from 'react';
import { render } from '@testing-library/react';
import { Ellipse } from './Ellipse';
import { EllipseLayer, LayerType } from '@/types/canvas';
import '@testing-library/jest-dom';

const mockLayer: EllipseLayer = {
    id: '1',
    type: LayerType.Ellipse,
    x: 10,
    y: 20,
    width: 100,
    height: 50,
    fill: { r: 255, g: 255, b: 255 },
};

const mockOnPointerDown = jest.fn();

test('renders ellipse with correct props', () => {
    const { container } = render(
        <Ellipse
            id="1"
            layer={mockLayer}
            onPointerDown={mockOnPointerDown}
            selectionColor="blue"
        />,
    );

    const ellipseElement = container.querySelector('ellipse');
    expect(ellipseElement).toBeInTheDocument();
    expect(ellipseElement).toHaveAttribute('cx', '50');
    expect(ellipseElement).toHaveAttribute('cy', '25');
    expect(ellipseElement).toHaveAttribute('rx', '50');
    expect(ellipseElement).toHaveAttribute('ry', '25');
    expect(ellipseElement).toHaveAttribute('fill', '#ffffff');
    expect(ellipseElement).toHaveAttribute('stroke', 'blue');
});
