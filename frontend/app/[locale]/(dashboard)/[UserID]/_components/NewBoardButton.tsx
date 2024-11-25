'use client';

import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import {useTranslations} from "next-intl";

interface NewBoardButtonProps {
    orgId: string;
    disabled?: boolean;
}

export const NewBoardButton = ({ disabled }: NewBoardButtonProps) => {
    const onClick = async () => {
        try {
        } catch (error) {
            console.error('Failed to create:', error);
        }
    };

    const t = useTranslations('utils')

    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'col-span-1 aspect-[100/127] bg-blue-500 rounded-lg hover:bg-blue-600 flex flex-col items-center justify-center py-6',
                disabled && 'opacity-75 hover:bg-blue-500 cursor-not-allowed',
            )}
        >
            <Plus className="h-12 w-12 text-white stroke-2" />
            <p className="text-sm text-white font-medium">
                {t("newBoard")}
            </p>
        </button>
    );
};
