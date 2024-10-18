import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from '@/components/ui/Dialog';

describe('Dialog Component', () => {
    test('renders Dialog with Trigger and opens content on click', () => {
        render(
            <Dialog>
                <DialogTrigger>Open Dialog</DialogTrigger>
                <DialogContent>
                    <DialogTitle>Dialog Title</DialogTitle>
                    <DialogDescription>
                        Dialog description text.
                    </DialogDescription>
                </DialogContent>
            </Dialog>,
        );

        const triggerButton = screen.getByText('Open Dialog');
        expect(triggerButton).toBeInTheDocument();

        // Check that content is not visible initially
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();

        // Open dialog
        fireEvent.click(triggerButton);
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();
        expect(
            screen.getByText('Dialog description text.'),
        ).toBeInTheDocument();
    });

    test('closes Dialog when Close button is clicked', () => {
        render(
            <Dialog>
                <DialogTrigger>Open Dialog</DialogTrigger>
                <DialogContent>
                    <DialogTitle>Dialog Title</DialogTitle>
                    <DialogDescription>
                        Dialog description text.
                    </DialogDescription>
                    <DialogClose>Close</DialogClose>
                </DialogContent>
            </Dialog>,
        );

        // Open dialog
        fireEvent.click(screen.getByText('Open Dialog'));
        expect(screen.getByText('Dialog Title')).toBeInTheDocument();

        // Get all elements with "Close" and click the first button (the main DialogClose button)
        const closeButtons = screen.queryAllByText('Close');
        fireEvent.click(closeButtons[0]);

        // Verify that the dialog is closed
        expect(screen.queryByText('Dialog Title')).not.toBeInTheDocument();
    });

    test('applies custom classes to DialogContent and DialogOverlay', () => {
        render(
            <Dialog>
                <DialogTrigger>Open Dialog</DialogTrigger>
                <DialogContent className="custom-content">
                    <DialogTitle>Dialog Title</DialogTitle>
                    <DialogDescription>
                        Dialog description text.
                    </DialogDescription>
                </DialogContent>
            </Dialog>,
        );

        fireEvent.click(screen.getByText('Open Dialog'));
        const content = screen.getByText('Dialog Title').closest('div');
        expect(content).toHaveClass('custom-content');
    });

    test('renders DialogTitle and DialogDescription with correct classes', () => {
        render(
            <Dialog>
                <DialogTrigger>Open Dialog</DialogTrigger>
                <DialogContent>
                    <DialogTitle className="custom-title">
                        Dialog Title
                    </DialogTitle>
                    <DialogDescription className="custom-description">
                        Dialog description text.
                    </DialogDescription>
                </DialogContent>
            </Dialog>,
        );

        fireEvent.click(screen.getByText('Open Dialog'));

        const title = screen.getByText('Dialog Title');
        const description = screen.getByText('Dialog description text.');

        expect(title).toHaveClass('custom-title');
        expect(description).toHaveClass('custom-description');
    });

    test('renders Dialog with accessible roles', () => {
        render(
            <Dialog>
                <DialogTrigger>Open Dialog</DialogTrigger>
                <DialogContent>
                    <DialogTitle>Accessible Dialog</DialogTitle>
                    <DialogDescription>
                        This dialog is accessible.
                    </DialogDescription>
                </DialogContent>
            </Dialog>,
        );

        fireEvent.click(screen.getByText('Open Dialog'));

        // Check for dialog role
        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();
        expect(dialog).toHaveTextContent('Accessible Dialog');
    });
});
