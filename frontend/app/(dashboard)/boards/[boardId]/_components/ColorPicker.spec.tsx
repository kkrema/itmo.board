// ColorPicker.spec.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ColorPicker from './ColorPicker';

describe('ColorPicker Component', () => {
    const defaultColor = '#ff0000';
    const onChangeMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders color picker with default color', () => {
        render(<ColorPicker color={defaultColor} onChange={onChangeMock} />);

        const colorInput = screen.getByDisplayValue(defaultColor);
        expect(colorInput).toBeInTheDocument();
        expect(colorInput).toHaveAttribute('type', 'color');
        expect(colorInput).toHaveClass('color-picker');
    });

    test('calls onChange with correct color when color changes', () => {
        render(<ColorPicker color={defaultColor} onChange={onChangeMock} />);

        const newColor = '#00ff00';
        const colorInput = screen.getByDisplayValue(defaultColor);

        // Simulate changing color in the color input
        fireEvent.change(colorInput, { target: { value: newColor } });
        expect(onChangeMock).toHaveBeenCalledWith(newColor);
    });
});
