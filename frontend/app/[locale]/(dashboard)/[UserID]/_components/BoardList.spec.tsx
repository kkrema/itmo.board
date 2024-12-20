import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BoardList, Board, getAllBoards } from './BoardList';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';
import { ClerkProvider, useClerk } from '@clerk/nextjs';

jest.mock('next/navigation', () => ({
    useParams: jest.fn(),
    useSearchParams: jest.fn(),
    useRouter: jest.fn(),
    usePathname: jest.fn(),
}));

jest.mock('./BoardList', () => {
    const originalModule = jest.requireActual('./BoardList');
    return {
        __esModule: true,
        ...originalModule,
        getAllBoards: jest.fn(),
    };
});

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(),
}));

jest.mock('@clerk/nextjs', () => ({
    useClerk: jest.fn(),
    ClerkProvider: jest.fn(),
}));

describe('BoardList Component', () => {
    const mockBoards: Board[] = [
        {
            _id: '1',
            title: 'Test Board 1',
            authorId: 'user1',
            createdAt: '2023-11-01T10:00:00Z',
            orgId: 'org1',
            imageUrl: '/images/board1.png',
        },
        {
            _id: '2',
            title: 'Test Board 2',
            authorId: 'user2',
            createdAt: '2023-11-02T11:00:00Z',
            orgId: 'org1',
            imageUrl: '/images/board2.png',
        },
    ];

    const messages: { [key: string]: string } = {
        searchBoards: 'search boards',
        notFound: 'no results found',
        tryAnother: 'try searching for something else',
    };
    const mockUseTranslations = useTranslations as jest.Mock;
    mockUseTranslations.mockImplementation(
        () => (key: string) => messages[key],
    );

    const mockClerkProvider = ClerkProvider as jest.Mock;
    mockClerkProvider.mockImplementation(({ children }) => <>{children}</>);

    const mockUseClerk = useClerk as jest.Mock;
    mockUseClerk.mockReturnValue({ user: { firstName: 'you' } });

    const renderWithClerk = (component: React.ReactNode) => {
        return render(<ClerkProvider>{component}</ClerkProvider>);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fetches boards on mount and displays them', async () => {
        (useParams as jest.Mock).mockReturnValue({ UserID: '123' });
        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn(),
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
            replace: jest.fn(),
            pathname: '/some-path',
            query: {},
        });
        (getAllBoards as jest.Mock).mockResolvedValue(mockBoards);

        renderWithClerk(<BoardList orgId="org1" query={{}} />);

        await waitFor(() => {
            expect(screen.getByText('Test Board 1')).toBeInTheDocument();
            expect(screen.getByText('Test Board 2')).toBeInTheDocument();
        });
    });

    test('filters boards based on search param', async () => {
        (useParams as jest.Mock).mockReturnValue({ UserID: '123' });
        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockImplementation((key) => {
                if (key === 'search') {
                    return 'Board 1';
                }
                return null;
            }),
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
            replace: jest.fn(),
            pathname: '/some-path',
            query: {},
        });
        (getAllBoards as jest.Mock).mockResolvedValue(mockBoards);

        renderWithClerk(<BoardList orgId="org1" query={{}} />);

        await waitFor(() => {
            expect(screen.getByText('Test Board 1')).toBeInTheDocument();
            expect(screen.queryByText('Test Board 2')).not.toBeInTheDocument();
        });
    });

    test('shows EmptySearch when no boards match the search', async () => {
        (useParams as jest.Mock).mockReturnValue({ UserID: '123' });
        (useSearchParams as jest.Mock).mockReturnValue({
            get: jest.fn().mockImplementation((key) => {
                if (key === 'search') {
                    return 'NonExistingBoard';
                }
                return null;
            }),
        });
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
            replace: jest.fn(),
            pathname: '/some-path',
            query: {},
        });
        (getAllBoards as jest.Mock).mockResolvedValue(mockBoards);

        render(<BoardList orgId="org1" query={{}} />);

        await waitFor(() => {
            expect(screen.getByText('no results found')).toBeInTheDocument();
        });
    });
});
