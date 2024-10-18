// app/page.tsx
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Loader } from 'lucide-react';

export default function HomePage() {
    const { userId } = auth();

    if (userId) {
        redirect(`/${userId}`);
    } else {
        redirect(`/sign-in`);
    }

    return (
        <div className="w-full h-full flex items-center justify-center">
            <Loader className="animate-spin" />
        </div>
    );
}
