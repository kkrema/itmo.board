import React from 'react';
import { render } from '@testing-library/react';
import { Grid, GridProps, STROKE_STYLES } from './Grid';
import '@testing-library/jest-dom';
import { MAX_ZOOM, MIN_ZOOM } from '@/app/(dashboard)/boards/[boardId]/_components/Canvas';

jest.mock('nanoid', () => ({
    nanoid: () => 'nanoid',
}));

describe('Grid Component', () => {
    const renderGrid = (props: GridProps) => {
        return render(
            <svg>
                <Grid {...props} />
            </svg>,
        );
    };

    it('renders without crashing', () => {
        const props = {
            camera: { x: 0, y: 0 },
            scale: 1,
            width: 500,
            height: 500,
        };

        renderGrid(props);
    });

    it('renders the correct number of grid lines at default scale', () => {
        const props = {
            camera: { x: 0, y: 0 },
            scale: 1,
            width: 10,
            height: 10,
        };

        const { container } = renderGrid(props);

        const lines = container.querySelectorAll('line');
        // Expected levels: 1000, 500, 100, 50, 10
        // 1 vertical and 1 horizontal line for level 1000
        // levels 500, 100, 50 have repeated lines -> 0 lines
        // 1 vertical and 1 horizontal lines for level 10
        expect(lines.length).toBe(4);
    });

    it('does not render grid levels that are too dense', () => {
        const props = {
            camera: { x: 0, y: 0 },
            scale: MIN_ZOOM,
            width: 10,
            height: 10,
        };

        const { container } = renderGrid(props);

        const lines = container.querySelectorAll('line');

        // (level) => level * scale
        // minGridSpacing = 10
        // 1000 => 1000 * 0.1 = 100 ---> 2 lines
        // 500 => 500 * 0.1 = 50 ---> 2 lines (repeated)
        // 100 => 100 * 0.1 = 10 ---> 4 lines (2 not repeated)
        expect(lines.length).toBe(4);
    });

    it('renders all applicable grid levels when scale allows', () => {
        const props = {
            camera: { x: 0, y: 0 },
            scale: MAX_ZOOM,
            width: 10,
            height: 10,
        };

        const { container } = renderGrid(props);

        const lines = container.querySelectorAll('line');

        // (level) => level * scale
        // minGridSpacing = 10
        // 1000 => 1000 * 20 = 20000 ---> 2 lines
        // 500 => 500 * 20 = 10000 ---> 2 lines (repeated)
        // 100 => 100 * 20 = 2000 ---> 2 lines (repeated)
        // 50 => 50 * 20 = 1000 ---> 2 lines (repeated)
        // 10 => 10 * 20 = 200 ---> 2 lines (repeated)
        // 5 => 5 * 20 = 100 ---> 2 lines (repeated)
        // 1 => 1 * 20 = 20 ---> 2 lines (repeated)
        expect(lines.length).toBe(2);
    });

    it('grid lines have correct stroke and strokeWidth attributes', () => {
        const props = {
            camera: { x: 0, y: 0 },
            scale: 1,
            width: 100,
            height: 100,
        };

        const { container } = renderGrid(props);
        const lines = container.querySelectorAll('line');

        lines.forEach((line) => {
            const stroke = line.getAttribute('stroke');
            const strokeWidth = line.getAttribute('stroke-width');

            const validStrokes = STROKE_STYLES.map(style => style.stroke);
            const validStrokeWidths = STROKE_STYLES.map(style => style.strokeWidth.toString());

            expect(validStrokes).toContain(stroke);
            expect(validStrokeWidths).toContain(strokeWidth);
            expect(parseFloat(strokeWidth!)).toBeGreaterThan(0);
        });
    });

    it('does not render grid lines with spacing less than minGridSpacing', () => {
        const props = {
            camera: { x: 0, y: 0 },
            scale: 0.009, // All gridSpacingInPixels < MIN_GRID_SPACING
            width: 100,
            height: 100,
        };

        const { container } = renderGrid(props);
        const lines = container.querySelectorAll('line');
        expect(lines.length).toBe(0);
    });

    it('updates grid lines when camera position changes', () => {
        const initialProps = {
            camera: { x: 0, y: 0 },
            scale: 1,
            width: 100,
            height: 100,
        };

        const { container, rerender } = renderGrid(initialProps);
        const linesBefore = container.querySelectorAll('line');

        const updatedProps = {
            ...initialProps,
            camera: { x: 50, y: 50 },
        };

        rerender(
            <svg>
                <Grid {...updatedProps} />
            </svg>,
        );

        const linesAfter = container.querySelectorAll('line');

        expect(linesBefore[0].getAttribute('x1')).not.toBe(
            linesAfter[0].getAttribute('x1'),
        );
    });

    it('applies correct stroke styles based on grid spacing', () => {
        const props = {
            camera: { x: 0, y: 0 },
            scale: 1,
            width: 500,
            height: 500,
        };

        const { getByTestId } = renderGrid(props);
        const groups = getByTestId('grid').querySelectorAll('g');
        // Each <g> element has lines with same stroke and strokeWidth
        groups.forEach((group) => {
            const stroke = group.getAttribute('stroke');
            const strokeWidth = group.getAttribute('stroke-width');

            const matchingStyle = STROKE_STYLES.find(
                (style) => style.stroke === stroke && style.strokeWidth.toString() === strokeWidth
            );

            expect(matchingStyle).toBeDefined();
        });
    });
});
