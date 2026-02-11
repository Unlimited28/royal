import { test, expect } from '@playwright/test';

test.describe('Phase 4: Production Readiness Verification', () => {

  test('System Unavailable screen when backend is down', async ({ page }) => {
    // We simulate backend down by blocking the /api/health or any /api call
    await page.route('**/api/**', route => route.abort('failed'));
    await page.goto('/');
    await expect(page.locator('text=System Unavailable')).toBeVisible();
    await expect(page.locator('text=Try Reconnecting')).toBeVisible();
  });

  test('Registration -> Login Flow', async ({ page }) => {
    const email = `test_${Date.now()}@example.com`;
    // 1. Register
    await page.goto('/register');
    await page.selectOption('select[name="role"]', 'ambassador');
    await page.fill('input[name="fullname"]', 'Test Ambassador');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="phone"]', '08012345678');
    await page.fill('input[name="church"]', 'Test Church');
    await page.fill('input[name="age"]', '25');
    await page.selectOption('select[name="association_id"]', { index: 1 });
    await page.selectOption('select[name="rank_id"]', { index: 1 });
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to login
    await expect(page).toHaveURL(/\/login/);

    // 2. Login
    await page.selectOption('select[name="role"]', 'ambassador');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Test Ambassador')).toBeVisible();

    // 3. Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL(/\/login/);
  });

  test('Ambassador: Exam Enrollment and Results', async ({ page }) => {
    // Login as seeded ambassador
    await page.goto('/login');
    await page.selectOption('select[name="role"]', 'ambassador');
    await page.fill('input[name="email"]', 'ambassador@ogbcra.org');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/dashboard/);

    // Check Stats - should be real data from backend
    await expect(page.locator('text=Current Rank')).toBeVisible();
    await expect(page.locator('text=Candidate')).toBeVisible();

    // Navigate to My Exams via Sidebar
    await page.getByRole('link', { name: 'My Exams' }).click();
    await expect(page.locator('h1')).toContainText('My Exams');

    // Should see the seeded exam (even if it takes a moment to load)
    await expect(page.locator('text=Member Rank Examination')).toBeVisible({ timeout: 15000 });
  });

  test('Association President: User Approval and Camp Upload', async ({ page }) => {
    // Login as seeded president
    await page.goto('/login');
    await page.selectOption('select[name="role"]', 'president');
    await page.fill('input[name="passcode"]', 'presaccess123');
    await page.fill('input[name="email"]', 'president@ogbcra.org');
    await page.fill('input[name="password"]', 'presaccess123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/president\/dashboard/);

    // Verify stats
    await expect(page.locator('text=Total Ambassadors')).toBeVisible();

    // Navigate to Approvals via Sidebar
    await page.getByRole('link', { name: 'Approvals' }).click();
    await expect(page.locator('h1')).toContainText('Eligibility Approvals');

    // Navigate to Camp Management
    await page.getByRole('link', { name: 'Camp Reg' }).click();
    await expect(page.locator('h1')).toContainText('Camp Registrations');
    await expect(page.locator('text=Bulk Excel Upload')).toBeVisible();
  });

  test('Super Admin: Dashboard and Audit Logs', async ({ page }) => {
    // Login as seeded superadmin
    await page.goto('/login');
    await page.selectOption('select[name="role"]', 'superadmin');
    await page.fill('input[name="passcode"]', 'adminaccess123');
    await page.fill('input[name="email"]', 'admin@ogbcra.org');
    await page.fill('input[name="password"]', 'adminaccess123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/admin\/dashboard/);

    // Verify stats
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Ads')).toBeVisible();

    // Check Audit Logs
    await page.getByRole('link', { name: 'Audit Logs' }).click();
    await expect(page.locator('h1')).toContainText('Audit Logs');
  });

  test('Security: Unauthorized Access Prevention', async ({ page }) => {
    // Try to access admin dashboard without login
    await page.goto('/admin/dashboard');
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Login as Ambassador
    await page.goto('/login');
    await page.selectOption('select[name="role"]', 'ambassador');
    await page.fill('input[name="email"]', 'ambassador@ogbcra.org');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Try to access Super Admin dashboard
    await page.goto('/admin/dashboard');
    // Should NOT be on admin dashboard
    await expect(page).not.toHaveURL(/\/admin\/dashboard/);
  });
});
