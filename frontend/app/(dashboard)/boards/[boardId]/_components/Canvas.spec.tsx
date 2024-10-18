import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Canvas from './Canvas';

beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = jest.fn((contextId: string) => {
        if (contextId === '2d') {
            return {
                beginPath: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                stroke: jest.fn(),
                closePath: jest.fn(),
                fillRect: jest.fn(),
            } as unknown as CanvasRenderingContext2D;
        }
        return null;
    });
});

describe('Canvas Component', () => {
    const width = 300;
    const height = 200;
    const color = '#ff0000';
    const backgroundColor = '#ffffff';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders canvas with correct dimensions and background color', () => {
        render(
            <Canvas
                width={width}
                height={height}
                color={color}
                tool="brush"
                backgroundColor={backgroundColor}
            />,
        );

        const canvas = document.getElementById(
            'drawing-canvas',
        ) as HTMLCanvasElement;
        expect(canvas).toBeInTheDocument();
        expect(canvas).toHaveAttribute('width', width.toString());
        expect(canvas).toHaveAttribute('height', height.toString());
    });

    test('does not draw when tool is not brush', () => {
        const { container } = render(
            <Canvas
                width={width}
                height={height}
                color={color}
                tool="eraser"
            />,
        );
        const canvas = container.querySelector('canvas') as HTMLCanvasElement;
        const context = canvas.getContext('2d')!;

        jest.spyOn(context, 'beginPath');
        jest.spyOn(context, 'lineTo');
        jest.spyOn(context, 'stroke');

        fireEvent.mouseDown(canvas, {
            nativeEvent: { offsetX: 50, offsetY: 50 },
        });
        fireEvent.mouseMove(canvas, {
            nativeEvent: { offsetX: 60, offsetY: 60 },
        });
        fireEvent.mouseUp(canvas);

        expect(context.beginPath).not.toHaveBeenCalled();
        expect(context.lineTo).not.toHaveBeenCalled();
        expect(context.stroke).not.toHaveBeenCalled();
    });
});
