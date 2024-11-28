import { render, screen, fireEvent } from '@testing-library/react';
import { Note } from './Note';
import { LayerType, NoteLayer } from '@/types/canvas';
import '@testing-library/jest-dom';

jest.mock('@/lib/utils', () => ({
    calculateFontSize: jest.fn(() => 48),
    cn: jest.fn().mockReturnValue('mocked-class'),
    colorToCss: jest.fn(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`),
    getContrastingTextColor: jest.fn().mockReturnValue('#000000'),
}));

jest.mock('react-contenteditable', () => ({
    __esModule: true,
    default: ({
        html,
        onChange,
    }: {
        html: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }) => (
        <div contentEditable={true} onInput={onChange}>
            {html}
        </div>
    ),
}));

const mockLayer: NoteLayer = {
    id: 'note-1',
    type: LayerType.Note,
    x: 10,
    y: 20,
    width: 200,
    height: 100,
    fill: { r: 255, g: 0, b: 0 },
    value: 'Initial note text',
};

describe('Note component', () => {
    let onPointerDown: jest.Mock;

    beforeEach(() => {
        onPointerDown = jest.fn();

        jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(
            200,
        );
        jest.spyOn(
            HTMLElement.prototype,
            'offsetHeight',
            'get',
        ).mockReturnValue(100);
    });

    it('should render the note with initial value', () => {
        render(
            <Note
                id={mockLayer.id}
                layer={mockLayer}
                onPointerDown={onPointerDown}
            />,
        );

        expect(screen.getByText('Initial note text')).toBeInTheDocument();
    });

    it('should apply the correct background color based on fill', async () => {
        render(
            <Note
                id={mockLayer.id}
                layer={mockLayer}
                onPointerDown={onPointerDown}
            />,
        );

        // Wait for the foreignObject to appear in the DOM
        const foreignObjectElement = await screen.findByTestId(
            'note-foreign-object',
        );

        // Check the background color
        expect(foreignObjectElement).toHaveStyle(
            'background-color: rgb(255, 0, 0)',
        );
    });

    it('should apply correct text color based on fill', () => {
        render(
            <Note
                id={mockLayer.id}
                layer={mockLayer}
                onPointerDown={onPointerDown}
            />,
        );

        const contentEditable = screen.getByText('Initial note text');
        expect(contentEditable).toHaveStyle('color: #000000');
    });

    it('should call onPointerDown when clicked', () => {
        render(
            <Note
                id={mockLayer.id}
                layer={mockLayer}
                onPointerDown={onPointerDown}
            />,
        );

        const noteElement = screen.getByText('Initial note text').parentElement;
        if (noteElement) {
            fireEvent.pointerDown(noteElement);
        }

        expect(onPointerDown).toHaveBeenCalledWith(
            expect.any(Object),
            mockLayer.id,
        );
    });
});
