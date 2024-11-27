import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { ToolBar } from './Toolbar';
import { CanvasMode, LayerType } from '@/types/canvas';
import '@testing-library/jest-dom';
import type { ToolbarProps } from './Toolbar';
import { useTranslations } from 'next-intl';

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

jest.mock('next-intl', () => ({
    useTranslations: jest.fn(),
}));

describe('ToolBar Component', () => {
    const mockDeleteSelected = jest.fn();
    const mockMoveToFront = jest.fn();
    const mockMoveToBack = jest.fn();
    const mockMoveForward = jest.fn();
    const mockMoveBackward = jest.fn();
    const mockSetCanvasState = jest.fn();

    const messages: { [key: string]: string } = {
        bringToFront: 'bring to front',
        bringToBack: 'bring to back',
        moveForward: 'move forward',
        moveBackward: 'move backward',
        delete: 'delete',
        pen: 'pen',
        select: 'select',
        more: 'more',
        rectangle: "rectangle",
        ellipse: "ellipse",
        stickyNote: "sticky note"
    };
    const mockUseTranslations = useTranslations as jest.Mock;
    mockUseTranslations.mockImplementation(
        () => (key: string) => messages[key],
    );
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

        const deleteButton = screen.getByTestId('tool-button-delete');
        fireEvent.click(deleteButton);

        expect(mockDeleteSelected).not.toHaveBeenCalled();
    });

    it('calls deleteSelected when the Delete button is clicked', () => {
        setup();

        const deleteButton = screen.getByTestId('tool-button-delete');
        fireEvent.click(deleteButton);

        expect(mockDeleteSelected).toHaveBeenCalledTimes(1);
    });

    it('calls moveToFront when the Bring to Front button is clicked', () => {
        setup();

        fireEvent.click(screen.getByTestId('tool-button-more'));
        const bringToFrontButton = screen.getByTestId(
            'tool-button-bring to front',
        );
        fireEvent.click(bringToFrontButton);

        expect(mockMoveToFront).toHaveBeenCalledTimes(1);
    });

    it('calls moveToBack when the Send to Back button is clicked', () => {
        setup();

        fireEvent.click(screen.getByTestId('tool-button-more'));
        const bringToBackButton = screen.getByTestId(
            'tool-button-bring to back',
        );
        fireEvent.click(bringToBackButton);

        expect(mockMoveToBack).toHaveBeenCalledTimes(1);
    });

    it('calls moveForward when the Move Forward button is clicked', () => {
        setup();

        fireEvent.click(screen.getByTestId('tool-button-more'));
        const moveForwardButton = screen.getByTestId(
            'tool-button-move forward',
        );
        fireEvent.click(moveForwardButton);

        expect(mockMoveForward).toHaveBeenCalledTimes(1);
    });

    it('calls moveBackward when the Move Backward button is clicked', () => {
        setup();

        fireEvent.click(screen.getByTestId('tool-button-more'));
        const moveBackwardButton = screen.getByTestId(
            'tool-button-move backward',
        );
        fireEvent.click(moveBackwardButton);

        expect(mockMoveBackward).toHaveBeenCalledTimes(1);
    });

    it('sets canvas mode to None when Select button is clicked', () => {
        setup();

        const selectButton = screen.getByTestId('tool-button-select');
        fireEvent.click(selectButton);

        expect(mockSetCanvasState).toHaveBeenCalledWith({
            mode: CanvasMode.None,
        });
    });

    it('sets canvas mode to Pencil when Pen button is clicked', () => {
        setup();

        const penButton = screen.getByTestId('tool-button-pen');
        fireEvent.click(penButton);

        expect(mockSetCanvasState).toHaveBeenCalledWith({
            mode: CanvasMode.Pencil,
        });
    });

    it('sets mode to inserting and layerType to rectangle when Rectangle button is clicked', () => {
        setup();

        const rectangleButton = screen.getByTestId('tool-button-rectangle');
        fireEvent.click(rectangleButton);

        expect(mockSetCanvasState).toHaveBeenCalledWith({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Rectangle,
        });
    });

    it('sets mode to inserting and layerType to ellipse when Ellipse button is clicked', () => {
        setup();

        const ellipseButton = screen.getByTestId('tool-button-ellipse');
        fireEvent.click(ellipseButton);

        expect(mockSetCanvasState).toHaveBeenCalledWith({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Ellipse,
        });
    });

    it('sets mode to inserting and layerType to note when Sticky Note button is clicked', () => {
        setup();

        const noteButton = screen.getByTestId('tool-button-sticky note');
        fireEvent.click(noteButton);

        expect(mockSetCanvasState).toHaveBeenCalledWith({
            mode: CanvasMode.Inserting,
            layerType: LayerType.Note,
        });
    });

    it('disables all buttons when editable is false', () => {
        setup({ editable: false });

        const selectButton = screen.getByTestId('tool-button-select');
        const penButton = screen.getByTestId('tool-button-pen');
        const deleteButton = screen.getByTestId('tool-button-delete');

        expect(selectButton).toBeDisabled();
        expect(penButton).toBeDisabled();
        expect(deleteButton).toBeDisabled();
    });
});
