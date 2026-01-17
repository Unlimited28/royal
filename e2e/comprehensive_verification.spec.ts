import { test, expect } from '@playwright/test';

test.describe('RA Portal Comprehensive Verification', () => {

  test('Public Pages accessibility', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Royal Ambassadors');

    await page.goto('/blog');
    await expect(page.locator('h1')).toContainText('Ambassadors Blog');

    await page.goto('/gallery');
    await expect(page.locator('h1')).toContainText('Gallery');

    await page.goto('/media');
    await expect(page.locator('h1')).toContainText('Media Center');
  });

  test('Super Admin Dashboard and Required Pages', async ({ page }) => {
    // Login as Super Admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@royalambassadors.org');
    await page.fill('input[name="password"]', 'password');
    await page.selectOption('select[name="role"]', 'superadmin');
    await page.click('button:has-text("Login")');

    // Dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.locator('h1')).toContainText('Admin Dashboard');

    // Check Sidebar links
    const sidebar = page.locator('aside');
    await expect(sidebar.getByText('Blog Management')).toBeVisible();
    await expect(sidebar.getByText('Exam Control')).toBeVisible();
    await expect(sidebar.getByText('Ads Management')).toBeVisible();

    // Blog Management -> Create Post
    await page.click('text=Blog Management');
    await expect(page.locator('h1')).toContainText('Blog Management');
    await page.click('text=Create New Post');
    await expect(page.locator('h1')).toContainText('Create New Blog Post');

    // Exam Control -> Create Exam & Release Results
    await page.click('text=Exam Control');
    await expect(page.locator('h1')).toContainText('Exam Management');
    await expect(page.getByText('Create New Exam')).toBeVisible();
    await expect(page.getByText('Release Results')).toBeVisible();

    // Ads Management
    await page.click('text=Ads Management');
    await expect(page.locator('h1')).toContainText('Ads Management');

    // Shared content in Admin Dashboard
    await page.click('text=Blog View');
    await expect(page.locator('h1')).toContainText('Ambassadors Blog');
    await page.click('text=Gallery View');
    await expect(page.locator('h1')).toContainText('Gallery');
  });

  test('Ambassador Exam Flow and Shared Content', async ({ page }) => {
    // Login as Ambassador
    await page.goto('/login');
    await page.fill('input[name="email"]', 'ambassador@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.selectOption('select[name="role"]', 'ambassador');
    await page.click('button:has-text("Login")');

    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to My Exams
    await page.click('text=My Exams');
    await expect(page.locator('h1')).toContainText('My Exams');

    // Check for "Locked" status (since they start unapproved now)
    await expect(page.locator('td').getByText('Locked').first()).toBeVisible();

    // Shared content in Ambassador Dashboard
    await page.click('text=Blog');
    await expect(page.locator('h1')).toContainText('Ambassadors Blog');
    await page.click('text=Gallery');
    await expect(page.locator('h1')).toContainText('Gallery');

    // Verify role isolation: Try to access admin page
    await page.goto('/admin/dashboard');
    // Our ProtectedRoute currently redirects to / if unauthorized
    await expect(page).toHaveURL(/localhost:3000\/?$/);
  });

  test('Association President Features', async ({ page }) => {
    // Login as President
    await page.goto('/login');
    await page.fill('input[name="email"]', 'president@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.selectOption('select[name="role"]', 'president');
    await page.click('button:has-text("Login")');

    await expect(page).toHaveURL(/\/president\/dashboard/);

    // Shared content in President Dashboard
    await page.click('text=Blog');
    await expect(page.locator('h1')).toContainText('Ambassadors Blog');

    // Camp Registrations (Bulk Upload)
    await page.click('text=Camp Reg');
    await expect(page.locator('h1')).toContainText('Camp Registrations');
    await expect(page.getByText('Bulk Excel Upload')).toBeVisible();
    await expect(page.getByText('Initiate Bulk Payment')).toBeVisible();
  });
});
