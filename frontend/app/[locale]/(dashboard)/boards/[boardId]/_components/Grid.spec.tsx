import React from 'react';
import { render } from '@testing-library/react';
import {
    Grid,
    GRID_LEVELS,
    GridProps,
    MIN_GRID_SPACING,
    STROKE_STYLES,
} from './Grid';
import '@testing-library/jest-dom';
import {
    MAX_ZOOM,
    MIN_ZOOM,
} from '@/app/[locale]/(dashboard)/boards/[boardId]/_components/Canvas';

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

    it('renders the correct number of grid paths at default scale', () => {
        const props: GridProps = {
            camera: { x: 0, y: 0 },
            scale: 1,
            width: 10,
            height: 10,
        };

        const { container } = renderGrid(props);

        const paths = container.querySelectorAll('path');
        // With scale=1 and width=10, height=10:
        // GRID_LEVELS = [1000, 500, 100, 50, 10, 5, 1]
        // 5 grid levels will be more than 10 pixels apart
        expect(paths.length).toBe(5);

        // A single path must have that data
        const path = container.querySelector('path');
        expect(path).toHaveAttribute('d', 'M 0 0 L 0 10 M 0 0 L 10 0 ');
    });

    it('does not render grid paths for grid levels that are too dense', () => {
        const props: GridProps = {
            camera: { x: 0, y: 0 },
            scale: MIN_ZOOM,
            width: 10,
            height: 10,
        };

        const { container } = renderGrid(props);

        const paths = container.querySelectorAll('path');

        // Calculate which grid levels pass the min spacing
        const applicableLevels = GRID_LEVELS.filter(
            (gridSize) => gridSize * props.scale >= MIN_GRID_SPACING,
        );

        // Expect the number of paths to equal the number of applicable grid levels
        expect(paths.length).toBe(applicableLevels.length);

        // No paths are rendered for grid levels that are too dense
        GRID_LEVELS.forEach((gridSize) => {
            if (gridSize * props.scale < MIN_GRID_SPACING) {
                // These grid levels should not have corresponding paths
                expect(
                    container.querySelectorAll(`path[key="grid-${gridSize}"]`)
                        .length,
                ).toBe(0);
            }
        });
    });

    it('renders all applicable grid paths when scale allows', () => {
        const props: GridProps = {
            camera: { x: 0, y: 0 },
            scale: MAX_ZOOM, // High scale to allow all grid levels to pass min spacing
            width: 20000, // Large width and height to accommodate large grid lines
            height: 20000,
        };

        const { container } = renderGrid(props);

        const paths = container.querySelectorAll('path');

        // Calculate how many grid levels pass the min spacing
        const applicableLevels = GRID_LEVELS.filter(
            (gridSize) => gridSize * props.scale >= MIN_GRID_SPACING,
        );

        expect(paths.length).toBe(applicableLevels.length);
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

            const validStrokes = STROKE_STYLES.map((style) => style.stroke);
            const validStrokeWidths = STROKE_STYLES.map((style) =>
                style.strokeWidth.toString(),
            );

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

    it('updates grid paths when camera position changes', () => {
        const initialProps: GridProps = {
            camera: { x: 0, y: 0 },
            scale: 1,
            width: 100,
            height: 100,
        };

        const { container, rerender } = renderGrid(initialProps);
        const pathsBefore = container.querySelectorAll('path');

        // Capture the 'd' attributes before the update
        const dAttributesBefore = Array.from(pathsBefore).map((path) =>
            path.getAttribute('d'),
        );

        const updatedProps: GridProps = {
            ...initialProps,
            camera: { x: 50, y: 50 },
        };

        rerender(
            <svg>
                <Grid {...updatedProps} />
            </svg>,
        );

        const pathsAfter = container.querySelectorAll('path');

        // Capture the 'd' attributes after the update
        const dAttributesAfter = Array.from(pathsAfter).map((path) =>
            path.getAttribute('d'),
        );

        // Expect the 'd' attributes to have changed
        expect(dAttributesBefore).not.toEqual(dAttributesAfter);

        // Additionally, ensure that the number of paths remains consistent
        expect(pathsBefore.length).toBe(pathsAfter.length);
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
                (style) =>
                    style.stroke === stroke &&
                    style.strokeWidth.toString() === strokeWidth,
            );

            expect(matchingStyle).toBeDefined();
        });
    });
});
