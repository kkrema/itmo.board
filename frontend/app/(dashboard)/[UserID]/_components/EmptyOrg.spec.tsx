import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmptyOrg } from './EmptyOrg';

describe('EmptyOrg Component', () => {
    test('renders welcome message and create organization button', () => {
        render(<EmptyOrg />);

        expect(screen.getByText('Welcome to itmo.board')).toBeInTheDocument();

        expect(
            screen.getByText('Create an organization to get started!')
        ).toBeInTheDocument();

        const createButton = screen.getByRole('button', { name: /Create an Organization!/i });
        expect(createButton).toBeInTheDocument();
    });
});
