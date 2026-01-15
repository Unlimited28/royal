import { test, expect } from '@playwright/test';

test.describe('Login and Registration Page', () => {
  test('should display the role selector on the login page', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await expect(page.locator('h2', { hasText: 'Portal Login' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Login as' })).toBeVisible();
    await expect(page.locator('select[name="role"]')).toBeVisible();
    await expect(page.locator('option[value="ambassador"]')).toHaveText('Ambassador');
    await expect(page.locator('option[value="president"]')).toHaveText('Association President');
    await expect(page.locator('option[value="super_admin"]')).toHaveText('Super Admin');
    const screenshotPath = 'login_page.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });

  });

  test('should display the role selector on the registration page with correct roles', async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await expect(page.locator('h2', { hasText: 'Join Royal Ambassadors' })).toBeVisible();
    await expect(page.locator('label', { hasText: 'Select Your Role' })).toBeVisible();
    await expect(page.locator('select[name="role"]')).toBeVisible();
    await expect(page.locator('option[value="ambassador"]')).toHaveText('Ambassador');
    await expect(page.locator('option[value="president"]')).toHaveText('Association President');
    await expect(page.locator('option[value="admin"]')).not.toBeVisible();
    const screenshotPath = 'register_page.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
  });
});
