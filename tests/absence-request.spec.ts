import { test, expect } from '@playwright/test';

test.describe('Absence Request', () => {
    test('employee can submit an absence request', async ({ page }) => {
        // Login as employee
        await page.goto('/');
        await page.getByRole('button', { name: 'Employee (Own Profile)', exact: true }).click();
        await page.waitForLoadState('networkidle');

        // Navigate to absence section
        await page.locator('a[href="/absence"]:has-text("My Absence")').click();
        await page.waitForLoadState('networkidle');

        // Helper to click the first available button by exact name
        const clickFirstAvailableButton = async (names: string[]) => {
            for (const name of names) {
                const btn = page.getByRole('button', { name, exact: true });
                if (await btn.count()) {
                    try {
                        await btn.first().click();
                        return;
                    } catch { }
                }
            }
            throw new Error('No matching button found');
        };

        // Open new request form (try common labels)
        await clickFirstAvailableButton(['Request Time Off', 'Add Request', 'New Request']);

        // Fill out the absence request form
        const startDateInput = page.locator('input[type="date"]').first();
        const endDateInput = page.locator('input[type="date"]').nth(1);
        const reasonInput = page.locator('textarea, input[placeholder*="reason" i]');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);

        await startDateInput.fill(tomorrow.toISOString().split('T')[0]);
        await endDateInput.fill(dayAfter.toISOString().split('T')[0]);
        await reasonInput.fill('Personal vacation');

        // Submit the request
        await clickFirstAvailableButton(['Submit', 'Submit Request']);

        // Assert request appears or success toast is shown
        const successToast = page.locator('text=Request submitted successfully').or(page.locator('text=Request created'));
        if (await successToast.count()) {
            await expect(successToast.first()).toBeVisible();
        }
        await expect(page.locator('text=Personal vacation').first()).toBeVisible();
    });
});
