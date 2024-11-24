import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Overlay } from '@/app/[locale]/(dashboard)/[UserID]/_components/board-card/Overlay';

describe('Overlay Component', () => {
    test('renders with default classes', () => {
        render(<Overlay />);

        const overlayElement = document.getElementById('overlay');

        expect(overlayElement).toBeInTheDocument();
        expect(overlayElement).toHaveClass(
            'opacity-0',
            'group-hover:opacity-50',
            'transition-opacity',
            'h-full',
            'w-full',
            'bg-black',
        );
    });
});
