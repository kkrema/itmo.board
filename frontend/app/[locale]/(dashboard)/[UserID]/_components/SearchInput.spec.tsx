import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchInput } from './SearchInput';
import { useDebounce } from '@uidotdev/usehooks';
import { usePathname, useRouter } from 'next/navigation';
import qs from 'query-string';
import {useTranslations} from "next-intl";

jest.mock('@uidotdev/usehooks', () => ({
    useDebounce: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    usePathname: jest.fn(),
    useRouter: jest.fn(),
}));

jest.mock('lucide-react', () => ({
    Search: () => <svg data-testid="search-icon"></svg>,
}));

jest.mock('query-string', () => ({
    stringifyUrl: jest.fn(),
}));

jest.mock('@/components/ui/Input', () => ({
    Input: ({
        onChange,
        value,
        placeholder,
        className,
    }: {
        onChange: React.ChangeEventHandler<HTMLInputElement>;
        value: string;
        placeholder: string;
        className: string;
    }) => (
        <input
            data-testid="search-input"
            onChange={onChange}
            value={value}
            placeholder={placeholder}
            className={className}
        />
    ),
}));

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(),
}));

describe('SearchInput Component', () => {
    const mockReplace = jest.fn();
    const mockUsePathname = usePathname as jest.Mock;
    const mockUseRouter = useRouter as jest.Mock;
    const mockUseDebounce = useDebounce as jest.Mock;
    const mockStringifyUrl = qs.stringifyUrl as jest.Mock;
    const mockUseTranslations = useTranslations as jest.Mock;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Set default return values for mocks
        mockUsePathname.mockReturnValue('/boards');
        mockUseRouter.mockReturnValue({ replace: mockReplace });
        mockUseDebounce.mockImplementation((value: string) => value);

        mockUseTranslations.mockImplementation(() => () => 'Search boards');

        mockStringifyUrl.mockImplementation(
            ({
                url,
                query,
            }: {
                url: string;
                query: Record<string, string>;
            }) => {
                const queryString = new URLSearchParams(query).toString();
                return queryString ? `${url}?${queryString}` : url;
            },
        );
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('renders search icon and input field', () => {
        render(<SearchInput />);
        expect(screen.getByTestId('search-icon')).toBeInTheDocument();
        const input = screen.getByTestId('search-input');
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('placeholder', 'Search boards');
    });

    test('updates input value on change', () => {
        render(<SearchInput />);
        const input = screen.getByTestId('search-input') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'test' } });
        expect(input.value).toBe('test');
    });

    test('calls router.replace with correct URL after debounce', () => {
        jest.useFakeTimers();
        render(<SearchInput />);
        const input = screen.getByTestId('search-input') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'test' } });

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(mockStringifyUrl).toHaveBeenCalledWith(
            {
                url: '/boards',
                query: { search: 'test' },
            },
            { skipEmptyString: true, skipNull: true },
        );
        expect(mockReplace).toHaveBeenCalledWith('/boards?search=test');
        jest.useRealTimers();
    });

    test('does not include search query when input is empty', () => {
        jest.useFakeTimers();
        render(<SearchInput />);
        const input = screen.getByTestId('search-input') as HTMLInputElement;
        fireEvent.change(input, { target: { value: '' } });

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(mockStringifyUrl).toHaveBeenCalledWith(
            {
                url: '/boards',
                query: { search: '' },
            },
            { skipEmptyString: true, skipNull: true },
        );
        expect(mockReplace).toHaveBeenCalledWith('/boards?search=');
        jest.useRealTimers();
    });

    test('handles multiple rapid input changes with debounce', () => {
        jest.useFakeTimers();
        render(<SearchInput />);
        const input = screen.getByTestId('search-input') as HTMLInputElement;

        fireEvent.change(input, { target: { value: 't' } });
        fireEvent.change(input, { target: { value: 'te' } });
        fireEvent.change(input, { target: { value: 'tes' } });
        fireEvent.change(input, { target: { value: 'test' } });
        fireEvent.change(input, { target: { value: 'testi' } });

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(mockStringifyUrl).toHaveBeenCalledWith(
            {
                url: '/boards',
                query: { search: 'testi' },
            },
            { skipEmptyString: true, skipNull: true },
        );
        expect(mockReplace).toHaveBeenCalledWith('/boards?search=testi');
        jest.useRealTimers();
    });

    test('uses debounced value from useDebounce hook', () => {
        mockUseDebounce.mockImplementation((value: string) =>
            value.toUpperCase(),
        );
        jest.useFakeTimers();
        render(<SearchInput />);
        const input = screen.getByTestId('search-input') as HTMLInputElement;
        fireEvent.change(input, { target: { value: 'test' } });

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(mockStringifyUrl).toHaveBeenCalledWith(
            {
                url: '/boards',
                query: { search: 'TEST' },
            },
            { skipEmptyString: true, skipNull: true },
        );
        expect(mockReplace).toHaveBeenCalledWith('/boards?search=TEST');
        jest.useRealTimers();
    });
});
