import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from './Footer';

describe('Footer Component', () => {
    const defaultProps = {
        title: 'Sample Title',
        authorLabel: 'John Doe',
        createdAtLabel: '2023-01-01',
        disabled: false,
    };

    test('renders title, author label, and created at label', () => {
        render(<Footer {...defaultProps} />);

        expect(screen.getByText('Sample Title')).toBeInTheDocument();

        expect(screen.getByText('John Doe, 2023-01-01')).toBeInTheDocument();
    });

    test('button should be enabled when `disabled` prop is false', () => {
        render(<Footer {...defaultProps} disabled={false} />);

        const button = screen.getByRole('button');
        expect(button).toBeEnabled();
        expect(button).not.toHaveClass('cursor-not-allowed opacity-75');
    });

    test('button should be disabled when `disabled` prop is true', () => {
        render(<Footer {...defaultProps} disabled={true} />);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('cursor-not-allowed opacity-75');
    });

    test('hover effects for author and created at labels are applied', () => {
        render(<Footer {...defaultProps} />);

        const authorInfo = screen.getByText('John Doe, 2023-01-01');
        expect(authorInfo).toHaveClass(
            'opacity-0 group-hover:opacity-100 transition-opacity',
        );
    });
});
