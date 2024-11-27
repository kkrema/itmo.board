import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

test.setTimeout(30_000);

test('should log in and access page', async ({ page }) => {
    const username = process.env.TEST_USERNAME;
    const password = process.env.TEST_PASSWORD;

    if (!username || !password) {
        throw new Error(
            'Environment variables TEST_USERNAME and TEST_PASSWORD must be set',
        );
    }

    await page.goto('/');

    await page.fill('input[name="identifier"]', username);
    await page.fill('input[name="password"]', password);

    await Promise.all([
        page.click('button[data-localization-key="formButtonPrimary"]'),
        page.waitForURL((url) => {
            const path = new URL(url).pathname;
            return !path.includes('/sign-in');
        }),
    ]);

    await expect(page.locator('span')).toContainText('itmo.board');
});
