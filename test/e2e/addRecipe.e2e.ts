import test, { expect } from '@playwright/test';

const recipeFormPage = '/recipe';

test.describe('Does recipe form exist', () => {
	test('should have title', async ({ page }) => {
		await page.goto(recipeFormPage);
		await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
	});
	test('should have input for recipe title ', async ({ page }) => {
		await page.goto(recipeFormPage);
		await expect(page.getByLabel('Name', { exact: true })).toBeVisible();
	});
	test('should have input for description', async ({ page }) => {
		await page.goto(recipeFormPage);
		await expect(page.getByLabel('Description')).toBeVisible();
	});
	test('should have inputs for ingredients', async ({ page }) => {
		await page.goto(recipeFormPage);
		await expect(page.getByLabel('Ingredient name').first()).toBeVisible();
		await expect(page.getByLabel('Amount').first()).toBeVisible();
		await expect(page.getByLabel('Unit').first()).toBeVisible();
	});
	test('should have input for steps', async ({ page }) => {
		await page.goto(recipeFormPage);
		await expect(page.getByLabel('Step ').first()).toBeVisible();
	});
	test('should have button for adding ingredients', async ({ page }) => {
		await page.goto(recipeFormPage);
		await expect(
			page.getByRole('button', { name: 'Add ingredient' })
		).toBeVisible();
	});
	test('should have button for adding steps', async ({ page }) => {
		await page.goto(recipeFormPage);
		await expect(page.getByRole('button', { name: 'Add step' })).toBeVisible();
	});
});

test.describe('Recipe form actions', () => {
	test('add ingredient', async ({ page }) => {
		await page.goto(recipeFormPage);
		const ingredientBtn = await page.getByRole('button', {
			name: 'Add ingredient'
		});
		const expectedCount =
			(await page.getByLabel('Ingredient name').count()) + 1;
		await ingredientBtn.click();
		expect(await page.getByLabel('Ingredient name').count()).toEqual(
			expectedCount
		);
	});
	test('add step', async ({ page }) => {
		await page.goto(recipeFormPage);
		const expectedCount = (await page.getByLabel('Step ').count()) + 1;
		await page.getByRole('button', { name: 'Add step' }).click();
		expect(await page.getByLabel('Step ').count()).toEqual(expectedCount);
	});
	test('submit empty form', async ({ page }) => {
		// await page.goto(recipeFormPage);
		// await page.getByRole('button', { name: 'Add recipe' }).click();
		// await expect(page.getByText('Please fill out this field.')).toBeVisible();
	});
	test('submit half empty form', async ({ page }) => {});
	test('submit full form', async ({ page }) => {});
});
