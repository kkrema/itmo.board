import { render, screen, waitFor } from '@testing-library/react';
import { Hint } from '@/components/Hint';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
describe('Hint component', () => {
    it('displays the tooltip on hover', async () => {
        render(
            <Hint label="Test label" side="top" align="center">
                <button>Hover me</button>
            </Hint>,
        );

        userEvent.hover(screen.getByText('Hover me'));

        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent('Test label');
    });

    it('accepts and applies sideOffset and alignOffset props', async () => {
        render(
            <Hint
                label="Offset Test"
                side="top"
                align="center"
                sideOffset={10}
                alignOffset={5}
            >
                <button>Hover me</button>
            </Hint>,
        );

        userEvent.hover(screen.getByText('Hover me'));

        await waitFor(() => screen.getByRole('tooltip'));
        expect(screen.getByRole('tooltip')).toHaveTextContent('Offset Test');
    });

    it('renders with the correct label', async () => {
        render(
            <Hint label="Tooltip Label">
                <button>Hover me</button>
            </Hint>,
        );
        await userEvent.hover(screen.getByText('Hover me'));
        const tooltip = await screen.findByRole('tooltip');
        expect(tooltip).toHaveTextContent('Tooltip Label');
    });
});
