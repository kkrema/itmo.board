import { authMiddleware } from '@clerk/nextjs';

import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default authMiddleware({
    beforeAuth: (req) => {
        return intlMiddleware(req);
    },

    publicRoutes: ['/:locale', '/:locale/sign-in', '/:locale/sign-up'],
});

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
