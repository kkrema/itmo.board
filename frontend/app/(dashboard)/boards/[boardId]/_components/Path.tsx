import { getSvgPathFromStroke, optimizeStroke } from '@/lib/utils';
import { getStroke } from 'perfect-freehand';

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

export const Path = ({
    x,
    y,
    points,
    fill,
    onPointerDown,
    stroke,
}: PathProps) => {
    const strokePath = getSvgPathFromStroke(
        optimizeStroke(getStroke(points, getStrokeOptions)),
    );

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
};
