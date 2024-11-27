import { authMiddleware } from '@clerk/nextjs';

import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default authMiddleware({
    afterAuth: (auth, req) => {
        return intlMiddleware(req);
    },

    publicRoutes: ['/', '/sign-in', '/sign-up'],
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
