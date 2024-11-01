import { render, screen, fireEvent } from '@testing-library/react';
import { ToolButton } from './ToolButton';
import { Plus } from 'lucide-react';
import '@testing-library/jest-dom';
describe('ToolButton', () => {
    const mockOnClick = jest.fn();
    beforeEach(() => {
        mockOnClick.mockClear();
    });
    it('should call onClick handler when clicked', () => {
        render(
            <ToolButton
                label="Test Button"
                icon={Plus}
                onClick={mockOnClick}
            />
        );
        fireEvent.click(screen.getByRole('button'));
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
    it('should be disabled when isDisabled prop is true', () => {
        render(
            <ToolButton
                label="Test Button"
                icon={Plus}
                onClick={mockOnClick}
                isDisabled={true}
            />
        );
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(mockOnClick).toHaveBeenCalledTimes(0);
    });
    it('should have active style when isActive is true', () => {
        render(
            <ToolButton
                label="Active Button"
                icon={Plus}
                onClick={mockOnClick}
                isActive={true}
            />
        );
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-blue-500/20');
        expect(button).toHaveClass('text-blue-800');
    });
    it('should have inactive style when isActive is false', () => {
        render(
            <ToolButton
                label="Inactive Button"
                icon={Plus}
                onClick={mockOnClick}
                isActive={false}
            />
        );
        const button = screen.getByRole('button');
        expect(button).toHaveClass('hover:bg-blue-500/20');
        expect(button).not.toHaveClass('bg-blue-500/20');
        expect(button).not.toHaveClass('text-blue-800');
    });
});
