"use client";
import { LucideIcon } from "lucide-react";
import { Hint } from "@/components/Hint";
import { Button } from "@/components/ui/Button";
interface ToolButtonProps {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    isActive?: boolean;
    isDisabled?: boolean;
}
export const ToolButton = (props: ToolButtonProps) => {
    const { label, icon: Icon, onClick, isActive, isDisabled } = props;
    return (
        <Hint label={label} side="right" sideOffset={14}>
            <Button
                disabled={isDisabled}
                onClick={onClick}
                size="icon"
                variant={isActive ? "boardActive" : "board"}
            >
                <Icon />
            </Button>
        </Hint>
    );
};
