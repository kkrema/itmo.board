import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptySearch } from './EmptySearch';

describe('EmptySearch Component', () => {
    test('renders "No results found!" message', () => {
        render(<EmptySearch />);

        expect(screen.getByText('No results found!')).toBeInTheDocument();
        expect(
            screen.getByText('Try searching for something else!'),
        ).toBeInTheDocument();
    });
});
