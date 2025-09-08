import { test, expect } from '@playwright/test';

test.describe('Profile Management Flow', () => {
    test.beforeEach(async ({ page }) => {
        // ARRANGE - Login as employee before each test
        await page.goto('/');
        await page.click('button:has-text("Employee (Own Profile)")');
        // Wait for navigation to complete
        await page.waitForLoadState('networkidle');
    });

    test('should open profile edit modal and populate form data', async ({ page }) => {
        // ARRANGE - Navigate to profile section (assuming there's a profile link/button)
        // Look for common profile navigation elements
        const profileButton = page.getByRole('navigation').getByRole('link', { name: 'My Profile' })

        // ACT - Click to open profile modal
        if (await profileButton.isVisible()) {
            await profileButton.click();
        }
        // open edit modal
        await page.getByRole('button', { name: 'Edit Profile' }).click();

        // ASSERT - Verify modal opens and form is populated
        await expect(page.getByText('First Name*')).toBeVisible();
        await expect(page.locator('input[type="text"]').first()).toHaveValue(/.+/); // Should have some value
    });
});
