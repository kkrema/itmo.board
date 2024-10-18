import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
    test('renders an input element with default properties', () => {
        render(<Input />);
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
        expect(input).toHaveClass(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
        );
    });

    test('applies custom className', () => {
        render(<Input className="custom-class" />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveClass('custom-class');
    });

    test('renders input with specified type', () => {
        render(<Input type="password" placeholder="Enter password" />);
        const input = screen.getByPlaceholderText('Enter password');
        expect(input).toHaveAttribute('type', 'password');
    });

    test('renders input with placeholder', () => {
        const placeholderText = 'Enter your name';
        render(<Input placeholder={placeholderText} />);
        const input = screen.getByPlaceholderText(placeholderText);
        expect(input).toBeInTheDocument();
    });

    test('sets the disabled attribute correctly', () => {
        render(<Input disabled />);
        const input = screen.getByRole('textbox');
        expect(input).toBeDisabled();
        expect(input).toHaveClass(
            'disabled:cursor-not-allowed disabled:opacity-50',
        );
    });

    test('forwards ref correctly', () => {
        const ref = React.createRef<HTMLInputElement>();
        render(<Input ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    test('responds to user input', async () => {
        render(<Input />);
        const input = screen.getByRole('textbox');
        await userEvent.type(input, 'Test input');
        expect(input).toHaveValue('Test input');
    });
});
