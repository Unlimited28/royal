import { test, expect } from '@playwright/test';

test('public route', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page).toHaveTitle(/Vite \+ React \+ TS/);
  await page.screenshot({ path: '/home/jules/verification/public_route_test.png' });
});
