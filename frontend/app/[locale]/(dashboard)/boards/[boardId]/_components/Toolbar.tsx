import React, { useState } from 'react';
import {CanvasMode, CanvasState, LayerType} from '@/types/canvas';
import { ToolButton } from './ToolButton';
import {
    Trash2,
    BringToFront,
    SendToBack,
    MoreVertical,
    ArrowDown,
    ArrowUp,
    Pencil,
    MousePointer2, Square,
} from 'lucide-react';

export interface ToolbarProps {
    canvasState: CanvasState;
    setCanvasState: (newState: CanvasState) => void;
    editable: boolean;
    deleteSelected: () => void;
    moveToFront: () => void;
    moveToBack: () => void;
    moveForward: () => void;
    moveBackward: () => void;
}

export const ToolBar = ({
    canvasState,
    setCanvasState,
    editable,
    deleteSelected,
    moveToFront,
    moveToBack,
    moveForward,
    moveBackward,
}: ToolbarProps) => {
    const [showExtraTools, setShowExtraTools] = useState(false);

    const handleToggleExtraTools = () => setShowExtraTools((prev) => !prev);

    const extraTools = [
        { label: 'Bring to Front', icon: BringToFront, action: moveToFront },
        { label: 'Send to Back', icon: SendToBack, action: moveToBack },
        { label: 'Move Forward', icon: ArrowUp, action: moveForward },
        { label: 'Move Backward', icon: ArrowDown, action: moveBackward },
    ];

    return (
        <div className="absolute bottom-5 left-[50%] -translate-x-[50%] flex items-center">
            {/* Toggle button for extra tools */}
            <div className="relative flex flex-col items-center">
                <div className="p-2 bg-white rounded-md shadow-md">
                    <ToolButton
                        label="More"
                        icon={MoreVertical}
                        onClick={handleToggleExtraTools}
                    />
                </div>

                {/* Extra tools dropdown */}
                {showExtraTools && (
                    <div className="flex gap-4 p-2 bg-white rounded-md shadow-md absolute bottom-full mb-2">
                        {extraTools.map((tool, index) => (
                            <ToolButton
                                key={index}
                                label={tool.label}
                                icon={tool.icon}
                                onClick={tool.action}
                                isDisabled={!editable}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Spacer with 4-pixel gap */}
            <div style={{ width: '4px' }} />

            {/* Main toolbar */}
            <div className="flex gap-x-2 p-2 bg-white rounded-md shadow-md">
                <ToolButton
                    label="Select"
                    icon={MousePointer2}
                    onClick={() => setCanvasState({ mode: CanvasMode.None })}
                    isActive={
                        canvasState.mode === CanvasMode.None ||
                        canvasState.mode === CanvasMode.Translating ||
                        canvasState.mode === CanvasMode.SelectionNet ||
                        canvasState.mode === CanvasMode.Pressing ||
                        canvasState.mode === CanvasMode.Resizing
                    }
                    isDisabled={!editable}
                />
                <ToolButton
                    label="Pen"
                    icon={Pencil}
                    onClick={() =>
                        setCanvasState({
                            mode: CanvasMode.Pencil,
                        })
                    }
                    isActive={canvasState.mode === CanvasMode.Pencil}
                    isDisabled={!editable}
                />
                <ToolButton
                    label="Rectangle"
                    icon={Square}
                    onClick={() => setCanvasState({
                        mode: CanvasMode.Inserting,
                        layerType: LayerType.Rectangle,
                    })}
                    isActive={
                        canvasState.mode === CanvasMode.Inserting &&
                        canvasState.layerType === LayerType.Rectangle
                    }
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
