'use client';

import { clerkClient } from '@clerk/nextjs';
import { formatDistanceToNow } from 'date-fns';

import { Skeleton } from '@/components/ui/Skeleton';

import { Overlay } from './Overlay';
import { Footer } from './Footer';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {useTranslations} from "next-intl";

interface BoardCardProps {
    id: string;
    title: string;
    authorId: string;
    createdAt: Date;
    orgId: string;
}

export const BoardCard = ({
    id,
    title,
    authorId,
    createdAt,
}: BoardCardProps) => {
    const t = useTranslations('utils')

    const router = useRouter();
    const params = useParams();
    const [authorLabel, setAuthorLabel] = useState(
        params.UserID === authorId ? t('you') : t('teammate'),
    );
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const getFirstName = async (userID: string) => {
            const user = await clerkClient.users?.getUser(userID);
            setAuthorLabel(
                userID === authorId ? t('you') : user?.firstName || t('teammate'),
            );
        };
        getFirstName(params.UserID as string);
    });

    const createdAtLabel = formatDistanceToNow(new Date(createdAt), {
        addSuffix: true,
    });

    const onClick = () => {
        try {
            setLoading(true);
            router.push(`boards/${id}`);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="group aspect-[100/127] border rounded-lg flex cursor-pointer
            flex-col justify-between overflow-hidden relative"
            onClick={onClick}
        >
            <div className="relative flex-1 bg-white">
                <Overlay />
            </div>
            <Footer
                title={title}
                authorLabel={authorLabel}
                createdAtLabel={createdAtLabel}
                disabled={loading}
            />
        </div>
    );
};

BoardCard.Skeleton = function BoardCardSkeleton() {
    return (
        <div className="aspect-[100/127] rounded-lg overflow-hidden">
            <Skeleton className="h-full w-full" />
        </div>
    );
};
