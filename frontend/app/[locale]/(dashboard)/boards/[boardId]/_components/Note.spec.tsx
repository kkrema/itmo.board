import { render } from '@testing-library/react';
import { Note } from './Note';
import { LayerType, NoteLayer } from '@/types/canvas';
import '@testing-library/jest-dom';

const mockLayer: NoteLayer = {
    id: '1',
    type: LayerType.Note,
    x: 10,
    y: 20,
    width: 200,
    height: 100,
    fill: { r: 255, g: 255, b: 255 },
    value: 'Initial text',
};

const mockOnPointerDown = jest.fn();

test('renders note with correct props and initial text', () => {
    const { getByText, container } = render(
        <Note
            id="1"
            layer={mockLayer}
            onPointerDown={mockOnPointerDown}
            selectionColor="blue"
        />,
    );

    expect(getByText('Initial text')).toBeInTheDocument();

    const foreignObjectElement = container.querySelector('foreignObject');

    expect(foreignObjectElement).toHaveAttribute('x', '10');
    expect(foreignObjectElement).toHaveAttribute('y', '20');
    expect(foreignObjectElement).toHaveAttribute('width', '200');
    expect(foreignObjectElement).toHaveAttribute('height', '100');
});

test('applies correct font size based on width and height', () => {
    const { container } = render(
        <Note
            id="1"
            layer={mockLayer}
            onPointerDown={mockOnPointerDown}
            selectionColor="blue"
        />,
    );

    const contentEditable = container.querySelector(
        'div[contenteditable=true]',
    );

    expect(contentEditable).toHaveStyle(`font-size: 15px`);
});

test('applies contrasting text color based on fill color', () => {
    const { container } = render(
        <Note
            id="1"
            layer={{ ...mockLayer, fill: { r: 255, g: 0, b: 0 } }} // Красный фон
            onPointerDown={mockOnPointerDown}
            selectionColor="blue"
        />,
    );

    const contentEditable = container.querySelector(
        'div[contenteditable=true]',
    );
    expect(contentEditable).toHaveStyle('color: white');
});
