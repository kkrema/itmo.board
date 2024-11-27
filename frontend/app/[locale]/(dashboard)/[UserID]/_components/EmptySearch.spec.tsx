import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptySearch } from './EmptySearch';
import {useTranslations} from "next-intl";

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(),
}));

describe('EmptySearch Component', () => {
    const messages: {[key: string]: string} = {
        searchBoards: "search boards",
        notFound: "no results found",
        tryAnother: "try searching for something else"
    }
    const mockUseTranslations = useTranslations as jest.Mock;
    mockUseTranslations.mockImplementation(() => (key: string) => messages[key]);

    test('renders "no results found" message', () => {
        render(<EmptySearch />);

        expect(screen.getByText('no results found')).toBeInTheDocument();
        expect(
            screen.getByText('try searching for something else'),
        ).toBeInTheDocument();
    });
});
