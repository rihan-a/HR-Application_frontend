import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
    test('should successfully login with different user roles', async ({ page }) => {
        // ARRANGE - Navigate to the login page
        await page.goto('/');

        // Verify we're on the login page
        await expect(page.locator('h2')).toContainText('Employee Profile System');
        await expect(page.locator('text=Quick Demo Login')).toBeVisible();

        // ACT - Test Manager login
        await page.click('button:has-text("Manager (Full Access)")');

        // ASSERT - Verify successful login and navigation
        await expect(page).toHaveURL(/.*dashboard.*|.*profile.*/);

        // Verify user is logged in (look for profile elements or navigation)
        await expect(page.locator('text=Role: Manager')).toBeVisible();
    });

    test('should login as Employee and access profile features', async ({ page }) => {
        // ARRANGE - Navigate to login page
        await page.goto('/');

        // ACT - Login as Employee
        await page.click('button:has-text("Employee (Own Profile)")');

        // ASSERT - Verify employee-specific access
        await expect(page).toHaveURL(/.*dashboard.*|.*profile.*/);
        await expect(page.locator('text=Role: Employee')).toBeVisible();
    });


    test('should login as Co-worker and access public data', async ({ page }) => {
        // ARRANGE - Navigate to login page
        await page.goto('/');

        // ACT - Login as Co-worker
        await page.click('button:has-text("Co-worker (Public Data)")');

        // ASSERT - Verify co-worker access
        await expect(page).toHaveURL(/.*dashboard.*|.*profile.*/);
        await expect(page.locator('text=Role: Coworker')).toBeVisible();
    });


});
