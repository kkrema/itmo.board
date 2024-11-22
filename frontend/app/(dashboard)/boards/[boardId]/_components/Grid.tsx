import React, { memo, useMemo } from 'react';

export interface GridProps {
    camera: { x: number; y: number };
    scale: number;
    width: number;
    height: number;
}

// Minimum grid spacing in pixels
export const MIN_GRID_SPACING = 10;
export const GRID_LEVELS = [1000, 500, 100, 50, 10, 5, 1];
export const STROKE_STYLES = [
    { minSpacing: 100, stroke: '#999', strokeWidth: 1 },
    { minSpacing: 10, stroke: '#bbb', strokeWidth: 0.5 },
    { minSpacing: 0, stroke: '#ddd', strokeWidth: 0.25 },
];

export const Grid: React.FC<GridProps> = memo(
    ({ camera, scale, width, height }) => {
        const getStrokeStyle = (spacing: number) => {
            for (const style of STROKE_STYLES) {
                if (spacing >= style.minSpacing) {
                    return {
                        stroke: style.stroke,
                        strokeWidth: style.strokeWidth,
                    };
                }
            }
        };

        const gridLines = useMemo(() => {
            const lines: React.JSX.Element[] = [];

            // Calculate visible area in world coordinates
            const x0 = (0 - camera.x) / scale;
            const x1 = (width - camera.x) / scale;
            const y0 = (0 - camera.y) / scale;
            const y1 = (height - camera.y) / scale;

            const usedX = new Set<number>();
            const usedY = new Set<number>();
            GRID_LEVELS.forEach((gridSize) => {
                const gridSpacingInPixels = gridSize * scale;
                if (gridSpacingInPixels < MIN_GRID_SPACING) {
                    return; // Skip grid levels that are too dense
                }

                const { stroke, strokeWidth } =
                    getStrokeStyle(gridSpacingInPixels)!;

                // Calculate starting points for grid lines
                const xStart = Math.floor(x0 / gridSize) * gridSize;
                const yStart = Math.floor(y0 / gridSize) * gridSize;

                const verticalLines = [];
                for (let x = xStart; x <= x1; x += gridSize) {
                    if (usedX.has(x)) {
                        continue;
                    }
                    usedX.add(x);
                    const xScreen = x * scale + camera.x;
                    verticalLines.push(
                        <line
                            key={`v-${gridSize}-${x}`}
                            x1={xScreen}
                            y1={0}
                            x2={xScreen}
                            y2={height}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                        />,
                    );
                }

                const horizontalLines = [];
                for (let y = yStart; y <= y1; y += gridSize) {
                    if (usedY.has(y)) {
                        continue;
                    }
                    usedY.add(y);
                    const yScreen = y * scale + camera.y;
                    horizontalLines.push(
                        <line
                            key={`h-${gridSize}-${y}`}
                            x1={0}
                            y1={yScreen}
                            x2={width}
                            y2={yScreen}
                            stroke={stroke}
                            strokeWidth={strokeWidth}
                        />,
                    );
                }

                // Group lines of the same style
                lines.push(
                    <g
                        key={`grid-${gridSize}`}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                    >
                        {verticalLines}
                        {horizontalLines}
                    </g>,
                );
            });

            return lines;
        }, [camera, scale, width, height]);

        return <g data-testid="grid">{gridLines}</g>;
    },
);

Grid.displayName = 'Grid';
