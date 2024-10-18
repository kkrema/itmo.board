import { test, expect } from '@playwright/test';

test('should log in and access page', async ({ page }) => {
    const username = process.env.TEST_USERNAME;
    const password = process.env.TEST_PASSWORD;

    if (!username || !password) {
        throw new Error(
            'Environment variables TEST_USERNAME and TEST_PASSWORD must be set',
        );
    }

    await page.goto('http://localhost:3000/');

    await page.fill('input[name="identifier"]', username);
    await page.fill('input[name="password"]', password);

    await page.click('button[data-localization-key="formButtonPrimary"]');

    await expect(page.locator('h2')).toContainText('Welcome to itmo.board');
});
