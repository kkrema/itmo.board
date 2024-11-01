import React, { useState } from 'react';
import { ToolButton } from './ToolButton';
import {
    Trash2,
    BringToFront,
    SendToBack,
    MoreVertical,
    ArrowDown,
    ArrowUp,
    Pencil,
} from 'lucide-react';

interface ToolbarProps {
    onColorChange: (selectedColor: string) => void;
    currentColor: string;

    editable: boolean;
    deleteSelected: () => void;
    moveToFront: () => void;
    moveToBack: () => void;
    moveForward: () => void;
    moveBackward: () => void;
}

export const ToolBar = ({
    onColorChange,
    currentColor,
    editable,
    deleteSelected,
    moveToFront,
    moveToBack,
    moveForward,
    moveBackward,
}: ToolbarProps) => {
    const [showExtraTools, setShowExtraTools] = useState(false);

    const handleColorChange = (color: string) => {
        onColorChange(color);
    };

    return (
        <div className="absolute bottom-5 left-[50%] -translate-x-[50%] flex items-center">
            {/* Toggle button for extra tools */}
            <div className="relative flex flex-col items-center">
                <div className="p-2 bg-white rounded-md shadow-md">
                    <ToolButton
                        label="More"
                        icon={MoreVertical}
                        onClick={() => setShowExtraTools(!showExtraTools)}
                    />
                </div>

                {/* Extra tools dropdown with two columns */}
                {showExtraTools && (
                    <div className="flex gap-4 p-2 bg-white rounded-md shadow-md absolute bottom-full mb-2">
                        {/* Left column */}
                        <div className="flex flex-col gap-2">
                            <ToolButton
                                label="Bring to Front"
                                icon={BringToFront}
                                onClick={moveToFront}
                                isDisabled={!editable}
                            />
                            <ToolButton
                                label="Send to Back"
                                icon={SendToBack}
                                onClick={moveToBack}
                                isDisabled={!editable}
                            />
                        </div>

                        {/* Right column */}
                        <div className="flex flex-col gap-2">
                            <ToolButton
                                label="Move Forward"
                                icon={ArrowUp}
                                onClick={moveForward}
                                isDisabled={!editable}
                            />
                            <ToolButton
                                label="Move Backward"
                                icon={ArrowDown}
                                onClick={moveBackward}
                                isDisabled={!editable}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Spacer with 4-pixel gap */}
            <div style={{ width: '4px' }} />

            {/* Main toolbar */}
            <div className="flex gap-x-2 p-2 bg-white rounded-md shadow-md">
                {/* Example of color selection */}
                <ToolButton
                    label="Pen"
                    icon={Pencil} // Use an actual color icon here
                    onClick={() => handleColorChange('#FF5733')} // Example color change
                    isActive={currentColor === '#FF5733'}
                    isDisabled={!editable}
                />
            </div>

            {/* Spacer with 4-pixel gap */}
            <div style={{ width: '4px' }} />

            {/* Separate Trash button */}
            <div className="p-2 bg-white rounded-md shadow-md">
                <ToolButton
                    label="Delete"
                    icon={Trash2}
                    onClick={deleteSelected}
                    isDisabled={!editable}
                />
            </div>
        </div>
    );
};
