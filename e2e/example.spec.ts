import { test, expect } from '@playwright/test';

test('public route', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page).toHaveTitle(/Royal Ambassadors Portal | Ogun Baptist Conference/);
});
