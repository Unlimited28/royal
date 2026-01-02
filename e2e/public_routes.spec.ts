import { test, expect } from '@playwright/test';

test('Public route should display content', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
