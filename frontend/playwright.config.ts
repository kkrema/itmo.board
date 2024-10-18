import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    testMatch: '**/*.e2e.ts',
    testIgnore: '**/*.test.{ts,tsx}',
};

export default config;