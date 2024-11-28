import { NextFetchEvent, NextRequest } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default async function combinedMiddleware(
    req: NextRequest,
    event: NextFetchEvent,
) {
    const clerkHandler = clerkMiddleware();

    await clerkHandler(req, event);

    return intlMiddleware(req);
}

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
