import React from 'react';
import { render, screen } from '@testing-library/react';
import { SelectionTools } from './SelectionTools';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('./ColorPicker', () => ({
    ColorPicker: jest.fn(({ onChangeAction }) => (
        <button
            data-testid="color-picker-button"
            onClick={() => onChangeAction({ r: 255, g: 0, b: 0 })}
        >
            MockColorPicker
        </button>
    )),
}));

describe('SelectionTools', () => {
    it('calls setLastUsedColor when a color is selected', () => {
        const mockSetLastUsedColor = jest.fn();

        render(<SelectionTools setLastUsedColor={mockSetLastUsedColor} />);

        const colorPicker = screen.getByTestId('color-picker-button');

        fireEvent.click(colorPicker);

        expect(mockSetLastUsedColor).toHaveBeenCalledTimes(1);
        expect(mockSetLastUsedColor).toHaveBeenCalledWith({
            r: 255,
            g: 0,
            b: 0,
        });
    });

    it('renders without crashing', () => {
        const mockSetLastUsedColor = jest.fn();

        render(<SelectionTools setLastUsedColor={mockSetLastUsedColor} />);

        const container = screen.getByTestId('selection-tools-container');
        expect(container).toBeInTheDocument();
        expect(container).toHaveClass(
            'absolute p-3 rounded-xl bg-white shadow-sm border flex select-none',
        );
    });

    it('applies additional className if provided', () => {
        const mockSetLastUsedColor = jest.fn();
        const additionalClassName = 'custom-class';

        render(
            <SelectionTools
                setLastUsedColor={mockSetLastUsedColor}
                className={additionalClassName}
            />,
        );

        const container = screen.getByTestId('selection-tools-container');
        expect(container).toHaveClass(additionalClassName);
    });
});
