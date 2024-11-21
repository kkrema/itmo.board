import './globals.css';
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Provider, ErrorBoundary } from '@rollbar/react';

const rollbarConfig = {
    accessToken: process.env.NEXT_PUBLIC_ROLLBAR_ACCESS_TOKEN,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <Provider config={rollbarConfig}>
                <ErrorBoundary>
                    <ClerkProvider>
                        <body>{children}</body>
                    </ClerkProvider>
                </ErrorBoundary>
            </Provider>
        </html>
    );
}
