import React from 'react';

interface BoardCardProps {
    title: string;
    description?: string;
    onClick: () => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ title, description, onClick }) => (
    <div onClick={onClick} className="p-4 border rounded cursor-pointer hover:shadow-lg">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && <p className="text-gray-500">{description}</p>}
    </div>
);

export default BoardCard;
