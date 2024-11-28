'use client';

import { useAuth } from '@clerk/nextjs';
import { Loader } from 'lucide-react';
import { redirect } from '@/i18n/routing';

export default function HomePage() {
    const { userId } = useAuth();

    if (userId) {
        redirect({ href: `/${userId}`, locale: 'en' });
    } else {
        redirect({ href: '/sign-in', locale: 'en' });
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <Loader className="animate-spin" />
        </div>
    );
}
