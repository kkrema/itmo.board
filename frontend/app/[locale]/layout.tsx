import '../globals.css';
import React, { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Provider, ErrorBoundary } from '@rollbar/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const rollbarConfig = {
    accessToken: process.env.NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN,
};

export default async function LocaleLayout(
    { children, params}: { children: ReactNode; params: { locale: string }; }
) {
    const { locale } = await params;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const messages = await getMessages(locale);

    return (
        <html lang={locale}>
            <Provider config={rollbarConfig}>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <ErrorBoundary>
                        <ClerkProvider>
                            <body>
                                {children}
                            </body>
                        </ClerkProvider>
                    </ErrorBoundary>
                </ NextIntlClientProvider>
            </Provider>
        </html>
    );
}
