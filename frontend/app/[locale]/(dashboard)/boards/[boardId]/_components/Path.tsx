import { getSvgPathFromStroke, optimizeStroke } from '@/lib/utils';
import { getStroke } from 'perfect-freehand';
import { memo, useMemo } from 'react';

export interface PathProps {
    x: number;
    y: number;
    points: number[][];
    fill: string;
    onPointerDown?: (e: React.PointerEvent) => void;
    stroke?: string;
}

export const getStrokeOptions = {
    size: 4,
    thinning: 0.5,
    smoothing: 1,
    streamline: 0.5,
};

export const Path = memo(
    ({ x, y, points, fill, onPointerDown, stroke }: PathProps) => {
        const strokePath = useMemo(() => {
            const stroke = getStroke(points, getStrokeOptions);
            const optimizedStroke = optimizeStroke(stroke);
            return getSvgPathFromStroke(optimizedStroke);
        }, [points]);

        return (
            <path
                className="drop-shadow-md"
                onPointerDown={onPointerDown}
                d={strokePath}
                style={{
                    transform: `translate(${x}px, ${y}px)`,
                }}
                x={x}
                y={y}
                fill={fill}
                stroke={stroke}
                strokeWidth={1}
            />
        );
    },
);

Path.displayName = 'Path';
