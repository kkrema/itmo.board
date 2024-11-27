import { render, screen } from '@testing-library/react';
import { InviteButton } from './InviteButton';
import '@testing-library/jest-dom';
import { useTranslations } from 'next-intl';

jest.mock('@clerk/nextjs', () => ({
    OrganizationProfile: () => (
        <div data-testid='organization-profile'>Organization Profile</div>
    ),
}));

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(),
}));

describe('InviteButton Component', () => {
    const mockUseTranslations = useTranslations as jest.Mock;
    mockUseTranslations.mockImplementation(() => () => 'invite members');

    test('renders the invite button with correct label', () => {
        render(<InviteButton />);

        expect(
            screen.getByRole('button', { name: /invite members/i }),
        ).toBeInTheDocument();
    });
});
