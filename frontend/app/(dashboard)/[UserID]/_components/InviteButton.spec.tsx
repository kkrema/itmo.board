import { render, screen, fireEvent } from '@testing-library/react';
import { InviteButton } from './InviteButton';
import '@testing-library/jest-dom';

jest.mock('@clerk/nextjs', () => ({
    OrganizationProfile: () => <div data-testid="organization-profile">Organization Profile</div>
}));

describe('InviteButton Component', () => {
    test('renders the invite button with correct label', () => {
        render(<InviteButton />);

        expect(screen.getByRole('button', { name: /invite members/i })).toBeInTheDocument();
    });
});
