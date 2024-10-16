import React from 'react';

interface Board {
    id: string;
    title: string;
}

interface BoardListProps {
    boards: Board[];
}

export const BoardList = ({ boards }: BoardListProps) => {
    return (
        <div className="board-list">
            {boards.map((board) => (
                <div key={board.id} className="board-item">
                    {board.title}
                </div>
            ))}
        </div>
    );
};