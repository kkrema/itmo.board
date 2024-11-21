import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { StylesButton } from './StylesButton';
import '@testing-library/jest-dom';

describe('StylesButton Component', () => {
    const mockOnClick = jest.fn();
    const defaultProps = {
        id: 'styles-button',
        activeColor: { r: 255, g: 0, b: 0 },
        onClick: mockOnClick,
        className: '',
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<StylesButton {...defaultProps} />);
        const button = screen.getByRole('button', { name: /styles/i });
        expect(button).toBeInTheDocument();
    });

    it('applies the provided id to the button', () => {
        render(<StylesButton {...defaultProps} />);
        const button = screen.getByRole('button', { name: /styles/i });
        expect(button).toHaveAttribute('id', defaultProps.id);
    });

    it('displays the correct background and border color for the activeColor prop', () => {
        render(<StylesButton {...defaultProps} />);
        const colorIndicator = screen
            .getByRole('button', { name: /styles/i })
            .querySelector('span');
        expect(colorIndicator).toHaveStyle({
            backgroundColor: '#ff0000', // Hex for { r: 255, g: 0, b: 0 }
            borderColor: '#ff0000',
        });
    });

    it('triggers the onClick function when clicked', () => {
        render(<StylesButton {...defaultProps} />);
        const button = screen.getByRole('button', { name: /styles/i });
        fireEvent.click(button);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('applies additional className when provided', () => {
        const additionalClassName = 'custom-class';
        render(
            <StylesButton {...defaultProps} className={additionalClassName} />,
        );
        const button = screen.getByRole('button', { name: /styles/i });
        expect(button).toHaveClass(additionalClassName);
    });

    it('renders the span with the correct styles', () => {
        render(<StylesButton {...defaultProps} />);
        const span = screen
            .getByRole('button', { name: /styles/i })
            .querySelector('span');
        expect(span).toHaveClass('w-4 h-4 rounded-full border');
    });
});
