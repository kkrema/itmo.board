import { render, screen, fireEvent } from '@testing-library/react';
import { NewBoardButton } from '@/app/(dashboard)/[UserID]/_components/NewBoardButton';
import '@testing-library/jest-dom';

describe('NewBoardButton Component', () => {
    const defaultProps = {
        orgId: 'org123',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('button is disabled when `disabled` prop is true', () => {
        render(<NewBoardButton {...defaultProps} disabled={true} />);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('opacity-75 cursor-not-allowed');
    });

    test('clicking the button calls onClick when not disabled', () => {
        const consoleErrorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation();
        render(<NewBoardButton {...defaultProps} disabled={false} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(consoleErrorSpy).not.toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });
});
