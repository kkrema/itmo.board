import { cn } from "@/lib/utils";

interface FooterProps {
    title: string;
    authorLabel: string;
    createdAtLabel: string;
    disabled: boolean;
}

export const Footer = ({
                           title,
                           authorLabel,
                           createdAtLabel,
                           disabled,
                       }: FooterProps ) => {
    return (
        <div className="relative bg-white p-3">
            <p className="text-[13px] truncate max-w-[calc(100%-20px)]">{title}</p>
            <p className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-muted-foreground truncate">
                {authorLabel}, {createdAtLabel}
            </p>
            <button
                disabled={disabled}
                className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 text-muted-foreground hover:text-blue-600 z-50",
                    disabled && "cursor-not-allowed opacity-75"
                )}
            />
        </div>
    );
};
