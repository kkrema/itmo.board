"use client";

import { Color } from "@/types/canvas";
import { memo } from "react";
import { ColorPicker } from "./ColorPicker";

interface SelectionToolsProps {
    setLastUsedColor: (color: Color) => void;
    className?: string;
}

export const SelectionTools = memo(
    ({ setLastUsedColor }: SelectionToolsProps) => {
        const setFill = (fill: Color) => {
            setLastUsedColor(fill);
        };

        return (
            <div
                className="absolute p-3 rounded-xl bg-white shadow-sm border flex select-none"
                style={{
                    top: "65px",
                    right: "8px",
                }}
            >
                <ColorPicker onChange={setFill} />

            </div>
        );
    }
);

SelectionTools.displayName = "SelectionTools";