import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SelectionBox } from './SelectionBox';
import { useSelectionBounds } from '@/hooks/useSelectionBounds';
import { Layer, LayerType, XYWH, Side } from '@/types/canvas';
import '@testing-library/jest-dom';

jest.mock('@/hooks/useSelectionBounds');

const mockedUseSelectionBounds = useSelectionBounds as jest.MockedFunction<
    typeof useSelectionBounds
>;

// Define mock layers
const mockLayers: Layer[] = [
    {
        id: '1',
        type: LayerType.Rectangle,
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        fill: { r: 0, g: 0, b: 255 },
    },
    {
        id: '2',
        type: LayerType.Rectangle,
        x: 30,
        y: 40,
        width: 80,
        height: 60,
        fill: { r: 255, g: 0, b: 0 },
    },
    {
        id: '3',
        type: LayerType.Ellipse,
        x: 50,
        y: 60,
        width: 90,
        height: 100,
        fill: { r: 0, g: 255, b: 0 },
    },
];

const mockMap = new Map<string, Layer>(
    mockLayers.map((layer) => [layer.id, layer]),
);

// Define default props for the SelectionBox
const defaultProps = {
    onResizeHandlePointerDown: jest.fn(),
    isShowingHandles: false,
    selection: [] as string[],
    layersMap: mockMap,
};

describe('SelectionBox Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders nothing when useSelectionBounds returns null', () => {
        mockedUseSelectionBounds.mockReturnValue(null);

        render(<SelectionBox {...defaultProps} />);

        // Assert that nothing is rendered in the document
        expect(screen.queryByTestId('selection-rectangle')).toBeNull();
    });

    test('renders the selection rectangle with correct position and size', () => {
        const mockBounds: XYWH = {
            x: 10,
            y: 20,
            width: 100,
            height: 80,
        };

        mockedUseSelectionBounds.mockReturnValue(mockBounds);

        render(<SelectionBox {...defaultProps} selection={['1', '2']} />);

        const selectionRect = screen.getByTestId('selection-rectangle');
        expect(selectionRect).toBeInTheDocument();
        expect(selectionRect).toHaveAttribute('width', `${mockBounds.width}`);
        expect(selectionRect).toHaveAttribute('height', `${mockBounds.height}`);
        expect(selectionRect).toHaveStyle(
            `transform: translate(${mockBounds.x}px, ${mockBounds.y}px)`,
        );
    });

    test('does not render resize handles when isShowingHandles is false', () => {
        const mockBounds: XYWH = {
            x: 10,
            y: 20,
            width: 100,
            height: 80,
        };

        mockedUseSelectionBounds.mockReturnValue(mockBounds);

        render(
            <SelectionBox
                {...defaultProps}
                selection={['1', '2']}
                isShowingHandles={false}
            />,
        );

        const handles = screen.queryAllByTestId(/handle-\d+/);
        expect(handles.length).toBe(0);
    });

    test('renders eight resize handles when isShowingHandles is true', () => {
        const mockBounds: XYWH = {
            x: 10,
            y: 20,
            width: 100,
            height: 80,
        };

        mockedUseSelectionBounds.mockReturnValue(mockBounds);

        render(
            <SelectionBox
                {...defaultProps}
                selection={['1', '2']}
                isShowingHandles={true}
            />,
        );

        const handles = screen.getAllByTestId(/handle-\d+/);
        expect(handles.length).toBe(8);
    });

    test('each handle has the correct cursor and position', () => {
        const mockBounds: XYWH = {
            x: 10,
            y: 20,
            width: 100,
            height: 80,
        };

        mockedUseSelectionBounds.mockReturnValue(mockBounds);

        render(
            <SelectionBox
                {...defaultProps}
                selection={['1', '2']}
                isShowingHandles={true}
            />,
        );

        const handles = screen.getAllByTestId(/handle-\d+/);
        const expectedHandles = [
            {
                cursor: 'nwse-resize',
                transform: `translate(${mockBounds.x - 4}px, ${
                    mockBounds.y - 4
                }px)`,
            },
            {
                cursor: 'ns-resize',
                transform: `translate(${
                    mockBounds.x + mockBounds.width / 2 - 4
                }px, ${mockBounds.y - 4}px)`,
            },
            {
                cursor: 'nesw-resize',
                transform: `translate(${
                    mockBounds.x + mockBounds.width - 4
                }px, ${mockBounds.y - 4}px)`,
            },
            {
                cursor: 'ew-resize',
                transform: `translate(${
                    mockBounds.x + mockBounds.width - 4
                }px, ${mockBounds.y + mockBounds.height / 2 - 4}px)`,
            },
            {
                cursor: 'nwse-resize',
                transform: `translate(${
                    mockBounds.x + mockBounds.width - 4
                }px, ${mockBounds.y + mockBounds.height - 4}px)`,
            },
            {
                cursor: 'ns-resize',
                transform: `translate(${
                    mockBounds.x + mockBounds.width / 2 - 4
                }px, ${mockBounds.y + mockBounds.height - 4}px)`,
            },
            {
                cursor: 'nesw-resize',
                transform: `translate(${mockBounds.x - 4}px, ${
                    mockBounds.y + mockBounds.height - 4
                }px)`,
            },
            {
                cursor: 'ew-resize',
                transform: `translate(${mockBounds.x - 4}px, ${
                    mockBounds.y + mockBounds.height / 2 - 4
                }px)`,
            },
        ];

        handles.forEach((handle, index) => {
            expect(handle).toHaveStyle(
                `cursor: ${expectedHandles[index].cursor}`,
            );
            expect(handle).toHaveStyle(
                `transform: ${expectedHandles[index].transform}`,
            );
        });
    });

    test('clicking a handle triggers onResizeHandlePointerDown with correct arguments', () => {
        const mockBounds: XYWH = {
            x: 10,
            y: 20,
            width: 100,
            height: 80,
        };

        mockedUseSelectionBounds.mockReturnValue(mockBounds);

        const onResizeHandlePointerDown = jest.fn();

        render(
            <SelectionBox
                {...defaultProps}
                onResizeHandlePointerDown={onResizeHandlePointerDown}
                selection={['1', '2']}
                isShowingHandles={true}
            />,
        );

        const handles = screen.getAllByTestId(/handle-\d+/);

        const expectedCorners = [
            Side.Top + Side.Left,
            Side.Top,
            Side.Top + Side.Right,
            Side.Right,
            Side.Bottom + Side.Right,
            Side.Bottom,
            Side.Bottom + Side.Left,
            Side.Left,
        ];

        handles.forEach((handle, index) => {
            fireEvent.pointerDown(handle);
            expect(onResizeHandlePointerDown).toHaveBeenCalledWith(
                expectedCorners[index],
                mockBounds,
            );
            // Reset the mock for the next iteration
            onResizeHandlePointerDown.mockReset();
        });
    });
});
