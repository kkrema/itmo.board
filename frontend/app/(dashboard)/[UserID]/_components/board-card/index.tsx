import React from 'react';

interface BoardCardProps {
    id: string;
    title: string;
}

export const BoardCard = ({ id, title }: BoardCardProps) => {
    return (
        <div className="group border rounded-lg flex flex-col justify-between overflow-hidden relative">
            <div className="bg-white p-3">
                <p className="text-[13px] truncate">{title}</p>
            </div>
        </div>
    );
};
