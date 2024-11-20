import React from 'react';
import { render, fireEvent, RenderResult } from '@testing-library/react';
import { Path, PathProps } from './Path';
import { getSvgPathFromStroke } from '@/lib/utils';
import { getStroke } from 'perfect-freehand';
import '@testing-library/jest-dom';

jest.mock('@/lib/utils', () => ({
    getSvgPathFromStroke: jest.fn(),
}));

jest.mock('perfect-freehand', () => ({
    getStroke: jest.fn(),
}));

describe('Path Component', () => {
    const mockGetSvgPathFromStroke = getSvgPathFromStroke as jest.Mock;
    const mockGetStroke = getStroke as jest.Mock;

    const defaultProps = {
        x: 0,
        y: 0,
        points: [
            [0, 0],
            [10, 10],
            [20, 20],
        ],
        fill: 'red',
    };
    const mockStrokeData = ['M0,0 L10,10 L20,20'];
    const mockSvgPath = 'M0,0 L10,10 L20,20';

    beforeEach(() => {
        mockGetStroke.mockReturnValue(mockStrokeData);
        mockGetSvgPathFromStroke.mockReturnValue(mockSvgPath);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const renderPath = (props?: Partial<PathProps>): RenderResult => {
        return render(
            <svg>
                <Path {...defaultProps} {...props} />
            </svg>,
        );
    };

    test('renders a path element with correct attributes', () => {
        const { container } = renderPath({
            x: 50,
            y: 100,
            stroke: 'blue',
        });

        const pathElement = container.querySelector('path') as SVGPathElement;

        expect(pathElement).toBeInTheDocument();
        expect(pathElement).toHaveAttribute('fill', 'red');
        expect(pathElement).toHaveAttribute('stroke', 'blue');
        expect(pathElement).toHaveAttribute('stroke-width', '1');
        expect(pathElement).toHaveAttribute('d', mockSvgPath);
        expect(pathElement.getAttribute('style')).toContain(
            'transform: translate(50px, 100px)',
        );
    });

    test('calls getStroke with correct arguments', () => {
        renderPath();

        expect(mockGetStroke).toHaveBeenCalledWith(defaultProps.points, {
            size: 4,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
        });
    });

    test('calls getSvgPathFromStroke with the result of getStroke', () => {
        renderPath();

        expect(mockGetSvgPathFromStroke).toHaveBeenCalledWith(mockStrokeData);
    });

    test('handles onPointerDown event', () => {
        const mockPointerDownHandler = jest.fn();

        const { container } = renderPath({
            onPointerDown: mockPointerDownHandler,
        });

        const pathElement = container.querySelector('path') as SVGPathElement;

        fireEvent.pointerDown(pathElement);

        expect(mockPointerDownHandler).toHaveBeenCalledTimes(1);
    });

    test('renders without a stroke if not provided', () => {
        const { container } = renderPath({
            stroke: undefined,
        });

        const pathElement = container.querySelector('path') as SVGPathElement;

        expect(pathElement).not.toHaveAttribute('stroke');
    });
});
