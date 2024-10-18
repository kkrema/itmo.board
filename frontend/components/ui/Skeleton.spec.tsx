import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/ui/Skeleton';
import '@testing-library/jest-dom';

describe('Skeleton Component', () => {
    test('renders with default classes', () => {
        render(<Skeleton data-testid="skeleton" />);

        const skeleton = screen.getByTestId('skeleton');
        expect(skeleton).toHaveClass('animate-pulse');
        expect(skeleton).toHaveClass('bg-muted');
    });

    test('adds custom className', () => {
        render(<Skeleton className="custom-class" data-testid="skeleton" />);

        const skeleton = screen.getByTestId('skeleton');
        expect(skeleton).toHaveClass('animate-pulse');
        expect(skeleton).toHaveClass('bg-muted');
        expect(skeleton).toHaveClass('custom-class');
    });

    test('passes other props to div', () => {
        render(<Skeleton data-testid="skeleton-test" />);

        const skeleton = screen.getByTestId('skeleton-test');
        expect(skeleton).toBeInTheDocument();
    });
});
