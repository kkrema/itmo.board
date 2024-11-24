import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testMatch: '**/*.e2e.ts',
    testIgnore: '**/*.test.{ts,tsx}',
    use: {
        baseURL: 'http://localhost:3000',
    },
    timeout: 30000
};

export default config;
