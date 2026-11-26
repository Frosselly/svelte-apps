import test, { expect } from '@playwright/test';

const mainRecipePage = '/recipe';

test.describe('Does header with links exist', () => {
	test('should have link to all recipes', async ({ page }) => {
		await page.goto(mainRecipePage);
		await expect(
			page.getByRole('link', {
				name: 'All recipes'
			})
		).toBeVisible();
	});
	test('should have add recipe button', async ({ page }) => {
		await page.goto(mainRecipePage);
		await expect(
			page.getByRole('button', {
				name: 'Add recipe'
			})
		).toBeVisible();
	});
	test('should have auth form', async ({ page }) => {
		await page.goto(mainRecipePage);
		//check for input by label
		await expect(page.getByLabel('User:')).toBeVisible();
		//check for login button
		await expect(
			page.getByRole('button', {
				name: 'Login'
			})
		).toBeVisible();
	});
});

test.describe('Does search exist', () => {
	test('should have search input', async ({ page }) => {
		await page.goto(mainRecipePage);
		await expect(page.getByPlaceholder('Search your recipes...')).toBeVisible();
	});
	test('should have filters', async ({ page }) => {
		await page.goto(mainRecipePage);
		const filtersBtn = await page.getByRole('button', {
			name: 'Filters '
		});
		expect(filtersBtn).toBeVisible();
		await filtersBtn.click();
		//category filter
		await expect(page.getByText('Selecte categories:')).toBeVisible();
		const items = page.getByRole('listitem');
		await expect(items.filter({ has: page.getByRole('button') })).toBeVisible();
	});
});

test.describe('Does recipe list exist', () => {});

test.describe('Does pagination exist', () => {});
