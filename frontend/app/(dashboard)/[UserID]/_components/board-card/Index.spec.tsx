import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BoardCard } from '@/app/(dashboard)/[UserID]/_components/board-card/Index';
import { clerkClient } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { act } from 'react';

jest.mock('@clerk/nextjs', () => ({
    clerkClient: {
        users: {
            getUser: jest.fn(),
        },
    },
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn(() => ({ UserID: '123' })),
    usePathname: jest.fn(),
}));

describe('BoardCard Component', () => {
    const mockPush = jest.fn();
    const defaultProps = {
        id: '1',
        title: 'Project Board',
        authorId: '456',
        createdAt: new Date('2023-01-01'),
        orgId: 'org123',
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        jest.clearAllMocks();
    });

    test('sets loading state, navigates, and resets loading state after navigation', async () => {
        render(<BoardCard {...defaultProps} />);

        const card = screen.getByRole('button', { hidden: true });

        await act(async () => {
            fireEvent.click(card);
        });

        expect(mockPush).toHaveBeenCalledWith(`boards/${defaultProps.id}`);

        await waitFor(() => {
            expect(card).not.toHaveAttribute('disabled');
        });
    });

    test('displays "You" if the authorId matches UserID in params', async () => {
        (clerkClient.users.getUser as jest.Mock).mockResolvedValue({
            firstName: 'You',
        });

        render(<BoardCard {...defaultProps} authorId="123" />);

        await waitFor(() => {
            expect(
                screen.getByText((content) => content.includes('You,')),
            ).toBeInTheDocument();
        });
    });
});
