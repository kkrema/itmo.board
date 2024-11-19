import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Path } from './Path';
import * as utils from '@/lib/utils';
import * as perfectFreehand from 'perfect-freehand';
import '@testing-library/jest-dom';

jest.mock('@/lib/utils', () => ({
    getSvgPathFromStroke: jest.fn(),
}));

jest.mock('perfect-freehand', () => ({
    getStroke: jest.fn(),
}));

describe('Path Component', () => {
    const mockGetSvgPathFromStroke = utils.getSvgPathFromStroke as jest.Mock;
    const mockGetStroke = perfectFreehand.getStroke as jest.Mock;

    const mockPoints = [
        [0, 0],
        [10, 10],
        [20, 20],
    ];
    const mockStrokeData = ['M0,0 L10,10 L20,20'];
    const mockSvgPath = 'M0,0 L10,10 L20,20';

    beforeEach(() => {
        mockGetStroke.mockReturnValue(mockStrokeData);
        mockGetSvgPathFromStroke.mockReturnValue(mockSvgPath);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders a path element with correct attributes', () => {
        const { container } = render(
            <svg>
                <Path
                    x={50}
                    y={100}
                    points={mockPoints}
                    fill="red"
                    stroke="blue"
                />
            </svg>,
        );

        const pathElement = container.querySelector('path') as SVGPathElement;

        expect(pathElement).toBeInTheDocument();
        expect(pathElement).toHaveAttribute('fill', 'red');
        expect(pathElement).toHaveAttribute('stroke', 'blue');
        expect(pathElement).toHaveAttribute('stroke-width', '1');
        expect(pathElement).toHaveAttribute('d', mockSvgPath);
        expect(pathElement).toHaveStyle('transform: translate(50px, 100px)');
    });

    test('calls getStroke with correct arguments', () => {
        render(
            <svg>
                <Path x={0} y={0} points={mockPoints} fill="red" />
            </svg>,
        );

        expect(mockGetStroke).toHaveBeenCalledWith(mockPoints, {
            size: 4,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
        });
    });

    test('calls getSvgPathFromStroke with the result of getStroke', () => {
        render(
            <svg>
                <Path x={0} y={0} points={mockPoints} fill="red" />
            </svg>,
        );

        expect(mockGetSvgPathFromStroke).toHaveBeenCalledWith(mockStrokeData);
    });

    test('handles onPointerDown event', () => {
        const mockPointerDownHandler = jest.fn();

        const { container } = render(
            <svg>
                <Path
                    x={0}
                    y={0}
                    points={mockPoints}
                    fill="red"
                    onPointerDown={mockPointerDownHandler}
                />
            </svg>,
        );

        const pathElement = container.querySelector('path') as SVGPathElement;

        fireEvent.pointerDown(pathElement);

        expect(mockPointerDownHandler).toHaveBeenCalledTimes(1);
    });

    test('renders without a stroke if not provided', () => {
        const { container } = render(
            <svg>
                <Path x={0} y={0} points={mockPoints} fill="red" />
            </svg>,
        );

        const pathElement = container.querySelector('path') as SVGPathElement;

        expect(pathElement).not.toHaveAttribute('stroke');
    });
});
