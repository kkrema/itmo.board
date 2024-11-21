import React, { forwardRef } from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ColorPicker } from './ColorPicker';
import '@testing-library/jest-dom';

// Mock Input component properly with forwardRef
jest.mock('@/components/ui/Input', () => {
    const Input = forwardRef<
        HTMLInputElement,
        React.InputHTMLAttributes<HTMLInputElement>
    >((props, ref) => <input ref={ref} data-testid="color-input" {...props} />);
    Input.displayName = 'Input'; // Add displayName for ESLint compliance
    return { Input };
});

// Mock utility functions
jest.mock('@/lib/utils', () => ({
    colorToCss: jest.fn(({ r, g, b }) => `rgb(${r}, ${g}, ${b})`),
    parseColor: jest.fn((color: string) => {
        if (color === '#000000') return { r: 0, g: 0, b: 0 };
        if (color === '#ffffff') return { r: 255, g: 255, b: 255 };
        return null;
    }),
}));

describe('ColorPicker Component', () => {
    const mockOnChangeAction = jest.fn();

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders modern color buttons', () => {
        render(<ColorPicker onChangeAction={mockOnChangeAction} />);
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(8); // 7 modern colors + custom color picker button
    });

    it('calls onChangeAction when a modern color is clicked', () => {
        render(<ColorPicker onChangeAction={mockOnChangeAction} />);
        const colorButtons = screen.getAllByRole('button');
        fireEvent.click(colorButtons[0]); // Click the first modern color button
        expect(mockOnChangeAction).toHaveBeenCalledTimes(1);
        expect(mockOnChangeAction).toHaveBeenCalledWith({
            r: 0,
            g: 188,
            b: 212,
        }); // Cyan
    });

    it('triggers input click when the gradient button is clicked', () => {
        render(<ColorPicker onChangeAction={mockOnChangeAction} />);
        const gradientButton = screen.getByTitle('Choose your color');
        const inputElement = screen.getByTestId('color-input');

        // Mock the click behavior
        const clickSpy = jest.spyOn(inputElement, 'click');
        fireEvent.click(gradientButton);

        expect(clickSpy).toHaveBeenCalled();
    });

    it('updates the color when a custom color is selected', () => {
        render(<ColorPicker onChangeAction={mockOnChangeAction} />);
        const inputElement = screen.getByTestId('color-input');

        fireEvent.change(inputElement, { target: { value: '#000000' } });

        expect(mockOnChangeAction).toHaveBeenCalledWith({ r: 0, g: 0, b: 0 });
    });
});
