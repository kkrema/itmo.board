"use client";

import { useEffect, useState, useCallback } from "react";
import { EmptySearch } from "./EmptySearch";
import { NewBoardButton } from "./NewBoardButton";
import { useParams, useSearchParams } from "next/navigation";
import { BoardCard } from "./board-card/Index";

interface BoardListProps {
    orgId: string;
    query: {
        search?: string;
    };
}
export interface Board {
    _id: string;
    title: string;
    imageUrl?: string;
    authorId: string;
    createdAt?: string;
    orgId: string;
}

const mockBoards: Board[] = [
    {
        _id: "1",
        title: "Test Board 1",
        authorId: "user1",
        createdAt: "2023-11-01T10:00:00Z",
        orgId: "org1",
        imageUrl: "/images/board1.png",
    },
    {
        _id: "2",
        title: "Test Board 2",
        authorId: "user2",
        createdAt: "2023-11-02T11:00:00Z",
        orgId: "org1",
        imageUrl: "/images/board2.png",
    },
];

export const getAllBoards = async (userId: string, orgId: string): Promise<Board[]> => {
    console.log(`Mocking getAllBoards for user ${userId} and org ${orgId}`);
    return mockBoards;
};

export const BoardList = ({ orgId, query }: BoardListProps) => {
    const [data, setData] = useState<Board[]>([]);
    const [filteredData, setFilteredData] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const params = useParams();
    const searchParams = useSearchParams();

    const fetchBoards = useCallback(async (userId: string, orgId: string) => {
        try {
            setLoading(true);
            const boards = await getAllBoards(userId, orgId);
            setData(boards);
        } catch (error) {
            console.error("Error fetching boards:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (params.UserID) {
            fetchBoards(params.UserID as string, orgId);
        }
    }, [orgId, params.UserID, fetchBoards]);

    const filterBoards = useCallback(() => {
        const searchQuery = searchParams.get("search")?.toLowerCase() || "";
        const filteredBoards = data.filter((board) =>
            board.title.toLowerCase().includes(searchQuery)
        );
        setFilteredData(filteredBoards);
    }, [data, searchParams]);

    useEffect(() => {
        filterBoards();
    }, [data, searchParams, filterBoards]);

    const handleBoardCreated = (newBoard: Board) => {
        setData((prevData) => [newBoard, ...prevData]);
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
                <BoardCard.Skeleton />
                <BoardCard.Skeleton />
                <BoardCard.Skeleton />
                <BoardCard.Skeleton />
            </div>
        );
    }

    if (!filteredData.length && searchParams.get("search")) {
        return <EmptySearch />;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5 mt-8 pb-10">
            <NewBoardButton orgId={orgId} />
            {filteredData.map((board) => (
                <BoardCard
                    key={board._id}
                    id={board._id}
                    title={board.title}
                    authorId={board.authorId}
                    createdAt={new Date(board.createdAt || "")}
                    orgId={board.orgId}
                />
            ))}
        </div>
    );
};
