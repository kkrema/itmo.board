// Toolbar.spec.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toolbar from './Toolbar';

describe('Toolbar Component', () => {
    const onSelectToolMock = jest.fn();
    const onColorChangeMock = jest.fn();
    const initialColor = '#ff0000';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders toolbar with brush, eraser buttons, and color picker', () => {
        render(
            <Toolbar
                onSelectTool={onSelectToolMock}
                onColorChange={onColorChangeMock}
                currentColor={initialColor}
            />
        );

        const brushButton = screen.getByRole('button', { name: '🖌️' });
        const eraserButton = screen.getByRole('button', { name: '🧽' });
        const colorPicker = screen.getByDisplayValue(initialColor);

        expect(brushButton).toBeInTheDocument();
        expect(eraserButton).toBeInTheDocument();
        expect(colorPicker).toBeInTheDocument();
    });

    test('calls onSelectTool with "brush" when brush button is clicked', () => {
        render(
            <Toolbar
                onSelectTool={onSelectToolMock}
                onColorChange={onColorChangeMock}
                currentColor={initialColor}
            />
        );

        const brushButton = screen.getByRole('button', { name: '🖌️' });
        fireEvent.click(brushButton);

        expect(onSelectToolMock).toHaveBeenCalledWith('brush');
    });

    test('calls onSelectTool with "eraser" when eraser button is clicked', () => {
        render(
            <Toolbar
                onSelectTool={onSelectToolMock}
                onColorChange={onColorChangeMock}
                currentColor={initialColor}
            />
        );

        const eraserButton = screen.getByRole('button', { name: '🧽' });
        fireEvent.click(eraserButton);

        expect(onSelectToolMock).toHaveBeenCalledWith('eraser');
    });

    test('calls onColorChange with new color when color picker value changes', () => {
        render(
            <Toolbar
                onSelectTool={onSelectToolMock}
                onColorChange={onColorChangeMock}
                currentColor={initialColor}
            />
        );

        const newColor = '#00ff00';
        const colorPicker = screen.getByDisplayValue(initialColor);

        fireEvent.change(colorPicker, { target: { value: newColor } });
        expect(onColorChangeMock).toHaveBeenCalledWith(newColor);
    });
});
