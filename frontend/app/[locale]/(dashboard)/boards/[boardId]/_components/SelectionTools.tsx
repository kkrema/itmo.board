'use client';

import { Color } from '@/types/canvas';
import { memo } from 'react';
import { ColorPicker } from './ColorPicker';

interface SelectionToolsProps {
    setLastUsedColor: (color: Color) => void;
    className?: string;
}

export const SelectionTools = memo(
    ({ setLastUsedColor, className = '' }: SelectionToolsProps) => {
        const setFill = (fill: Color) => {
            setLastUsedColor(fill);
        };

        return (
            <div
                data-testid="selection-tools-container"
                className={`absolute p-3 rounded-xl bg-white shadow-sm border flex select-none ${className}`}
                style={{
                    top: '65px',
                    right: '8px',
                }}
            >
                <ColorPicker onChangeAction={setFill} />
            </div>
        );
    },
);

SelectionTools.displayName = 'SelectionTools';
