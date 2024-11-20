import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ToolBar } from './Toolbar';
import { CanvasMode } from '@/types/canvas';
import '@testing-library/jest-dom';
import type { ToolbarProps } from './Toolbar';

jest.mock('./ToolButton', () => ({
    ToolButton: ({ label, onClick, isDisabled }: never) => (
        <button
            data-testid={`tool-button-${label}`}
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
        >
            {label}
        </button>
    ),
}));

describe('ToolBar Component', () => {
    const mockDeleteSelected = jest.fn();
    const mockMoveToFront = jest.fn();
    const mockMoveToBack = jest.fn();
    const mockMoveForward = jest.fn();
    const mockMoveBackward = jest.fn();
    const mockSetCanvasState = jest.fn();

    type SetupProps = Partial<Parameters<typeof ToolBar>[0]>;

    const setup = (props: SetupProps = {}) => {
        const defaultProps: ToolbarProps = {
            canvasState: {
                mode: CanvasMode.None,
            },
            setCanvasState: mockSetCanvasState,
            editable: true,
            deleteSelected: mockDeleteSelected,
            moveToFront: mockMoveToFront,
            moveToBack: mockMoveToBack,
            moveForward: mockMoveForward,
            moveBackward: mockMoveBackward,
        };

        return render(<ToolBar {...defaultProps} {...props} />);
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('does not trigger actions for disabled buttons', () => {
        setup({ editable: false });

        const deleteButton = screen.getByTestId('tool-button-Delete');
        fireEvent.click(deleteButton);

        expect(mockDeleteSelected).not.toHaveBeenCalled();
    });

    it('calls deleteSelected when the Delete button is clicked', () => {
        setup();

        const deleteButton = screen.getByTestId('tool-button-Delete');
        fireEvent.click(deleteButton);

        expect(mockDeleteSelected).toHaveBeenCalledTimes(1);
    });

    it('calls moveToFront when the Bring to Front button is clicked', () => {
        setup();

        fireEvent.click(screen.getByTestId('tool-button-More'));
        const bringToFrontButton = screen.getByTestId(
            'tool-button-Bring to Front',
        );
        fireEvent.click(bringToFrontButton);

        expect(mockMoveToFront).toHaveBeenCalledTimes(1);
    });

    it('calls moveToBack when the Send to Back button is clicked', () => {
        setup();

        fireEvent.click(screen.getByTestId('tool-button-More'));
        const sendToBackButton = screen.getByTestId('tool-button-Send to Back');
        fireEvent.click(sendToBackButton);

        expect(mockMoveToBack).toHaveBeenCalledTimes(1);
    });

    it('calls moveForward when the Move Forward button is clicked', () => {
        setup();

        fireEvent.click(screen.getByTestId('tool-button-More'));
        const moveForwardButton = screen.getByTestId(
            'tool-button-Move Forward',
        );
        fireEvent.click(moveForwardButton);

        expect(mockMoveForward).toHaveBeenCalledTimes(1);
    });

    it('calls moveBackward when the Move Backward button is clicked', () => {
        setup();

        fireEvent.click(screen.getByTestId('tool-button-More'));
        const moveBackwardButton = screen.getByTestId(
            'tool-button-Move Backward',
        );
        fireEvent.click(moveBackwardButton);

        expect(mockMoveBackward).toHaveBeenCalledTimes(1);
    });

    it('sets canvas mode to None when Select button is clicked', () => {
        setup();

        const selectButton = screen.getByTestId('tool-button-Select');
        fireEvent.click(selectButton);

        expect(mockSetCanvasState).toHaveBeenCalledWith({
            mode: CanvasMode.None,
        });
    });

    it('sets canvas mode to Pencil when Pen button is clicked', () => {
        setup();

        const penButton = screen.getByTestId('tool-button-Pen');
        fireEvent.click(penButton);

        expect(mockSetCanvasState).toHaveBeenCalledWith({
            mode: CanvasMode.Pencil,
        });
    });

    it('disables all buttons when editable is false', () => {
        setup({ editable: false });

        const selectButton = screen.getByTestId('tool-button-Select');
        const penButton = screen.getByTestId('tool-button-Pen');
        const deleteButton = screen.getByTestId('tool-button-Delete');

        expect(selectButton).toBeDisabled();
        expect(penButton).toBeDisabled();
        expect(deleteButton).toBeDisabled();
    });
});
