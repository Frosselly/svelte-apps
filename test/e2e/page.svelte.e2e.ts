import { expect, test } from '@playwright/test';

test('has expected h1', async ({ page }) => {
	await page.goto('/demo/playwright');
	await expect(page.locator('h1')).toBeVisible();
});
test('shows lucky number', async ({ page }) => {
	// Arrange
	await page.goto('/demo/playwright');

	// Act
	await page
		.getByRole('button', {
			name: 'Generate'
		})
		.click();

	// Assert
	await expect(page.getByRole('heading', { level: 2 })).toContainText('Your lucky number');
});
