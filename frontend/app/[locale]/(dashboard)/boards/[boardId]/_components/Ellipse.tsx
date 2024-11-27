import { colorToCss } from '@/lib/utils';
import { EllipseLayer } from '@/types/canvas';
import React from 'react';

interface EllipseProps {
    id: string;
    layer: EllipseLayer;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
    selectionColor?: string;
}

export const Ellipse = ({
    id,
    layer,
    onPointerDown,
    selectionColor,
}: EllipseProps) => {
    const fillColor = layer.fill ? colorToCss(layer.fill) : '#000';
    const strokeColor = selectionColor || 'transparent';
    const cx = layer.width / 2;
    const cy = layer.height / 2;
    const rx = layer.width / 2;
    const ry = layer.height / 2;

    return (
        <ellipse
            className="drop-shadow-md"
            onPointerDown={(e) => onPointerDown(e, id)}
            style={{
                transform: `translate(
                    ${layer.x}px,
                    ${layer.y}px
                )`,
            }}
            cx={cx}
            cy={cy}
            rx={rx}
            ry={ry}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="1"
        />
    );
};
