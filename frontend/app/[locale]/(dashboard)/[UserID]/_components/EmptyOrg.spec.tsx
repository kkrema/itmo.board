import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptyOrg } from './EmptyOrg';
import {useTranslations} from "next-intl";

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(),
}));

describe('EmptyOrg Component', () => {
    const mockUseTranslations = useTranslations as jest.Mock;
    const messages: {[key: string]: string} = {
        welcome: "welcome to itmo.board",
        createOrganization: "create an organization to get started",
        createOrganizationButton: "create an organization",
    }
    mockUseTranslations.mockImplementation(() => (key: string) => messages[key]);

    test('renders welcome message and create organization button', () => {
        render(<EmptyOrg />);

        expect(screen.getByText('welcome to itmo.board')).toBeInTheDocument();

        expect(
            screen.getByText('create an organization to get started')
        ).toBeInTheDocument();

        const createButton = screen.getByRole('button', {
            name: /create an organization/i,
        });
        expect(createButton).toBeInTheDocument();
    });
});
