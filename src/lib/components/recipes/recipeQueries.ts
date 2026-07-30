import { db } from '$lib/server/db';
import {
	categories,
	ingredients,
	recipeCategories,
	recipeIngredients,
	recipes,
	steps,
	users
} from '$lib/server/db/schema';
import type {
	CreateRecipeModel,
	RecipePagingRequest,
	UpdateRecipeModel
} from './models';
import { recipeSortingKeys } from './recipeValidation';
import { asc, desc, like, getTableColumns, eq } from 'drizzle-orm';

export async function getRecipes(params?: RecipePagingRequest) {
	console.log('called with: ', params);
	if (!params)
		return await db
			.select({
				...getTableColumns(recipes),
				authorName: users.username,
				authorId: users.id
			})
			.from(recipes)
			.leftJoin(users, eq(recipes.userid, users.id));

	if (!params.sort) params.sort = [];
	const preparedSorting = params.sort.map((s) => {
		const direction = s.startsWith('-') ? desc : asc;
		const field = s.slice(1);

		return direction(field as (typeof recipeSortingKeys)[number]);
	});

	const res = await db
		.select({
			...getTableColumns(recipes),
			authorName: users.username,
			authorId: users.id
		})
		.from(recipes)
		.where(like(recipes.title, `%${params.q}%`))
		.leftJoin(users, eq(recipes.userid, users.id))
		.orderBy(...preparedSorting)
		.offset(params.offset)
		.limit(params.pageSize);
	console.log('res: ', res);
	return res;
}

export async function getRecipe(recipeId: string) {
	console.log('called with: ', recipeId);
	// const recipe = await db.query.recipes.findFirst({
	// 	where: eq(recipes.id, id)
	// });
	const recipeRow = await db
		.select()
		.from(recipes)
		.where(eq(recipes.id, recipeId))
		.get(); // or .then(r => r[0]) depending on your driver

	const ingredientRows = await db
		.select({
			amount: recipeIngredients.amount,
			unit: recipeIngredients.unit,
			name: ingredients.name
		})
		.from(recipeIngredients)
		.leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
		.where(eq(recipeIngredients.recipeId, recipeId));

	const stepRows = await db
		.select({
			stepNr: steps.stepNr,
			description: steps.description
		})
		.from(steps)
		.where(eq(steps.recipeId, recipeId))
		.orderBy(steps.stepNr);

	const author = await db
		.select({ name: users.username })
		.from(users)
		.where(eq(users.id, recipeRow.userid))
		.get();

	const shaped = {
		...recipeRow,
		ingredients: ingredientRows.map((r) => ({
			name: r.name,
			amount: r.amount,
			unit: r.unit
		})),
		steps: stepRows.map((r) => r.description),
		authorName: author.name
	};
	if (!shaped) return null;
	return shaped;
}

export async function insertRecipeWithIngredients(data: CreateRecipeModel) {
	const recipeId = crypto.randomUUID();
	const now = new Date();

	const imageUrl = '';

	await db.transaction(async (tx) => {
		await tx.insert(recipes).values({
			id: recipeId,
			title: data.title,
			description: data.description,
			category: data.category,
			cookTime: data.cookTime,
			prepTime: data.prepTime,
			servings: data.servings,
			imageUrl: imageUrl ?? null,
			notes: data.notes ?? null,
			userid: data.userId,
			createdAt: now,
			updatedAt: now
		});

		// await tx.insert(recipeIngredients).values(
		// 	data.ingredients.map((ingredient, index) => ({
		// 		id: crypto.randomUUID(),
		// 		recipeId,
		// 		name: ingredient.name,
		// 		amount: ingredient.amount,
		// 		unit: ingredient.unit
		// 	}))
		// );
		const ingredientRows = await Promise.all(
			data.ingredients.map(async (ingredient) => {
				const existing = await tx.query.ingredients.findFirst({
					where: (ingredients, { eq }) => eq(ingredients.name, ingredient.name)
				});
				const ingredientId = existing?.id ?? crypto.randomUUID();

				if (!existing) {
					await tx.insert(ingredients).values({
						id: ingredientId,
						name: ingredient.name
					});
				}
				return {
					id: crypto.randomUUID(),
					recipeId,
					ingredientId,
					amount: ingredient.amount,
					unit: ingredient.unit
				};
			})
		);

		await tx.insert(recipeIngredients).values(ingredientRows);

		await tx.insert(steps).values(
			data.steps.map((description, i) => ({
				id: crypto.randomUUID(),
				recipeId,
				stepNr: i + 1,
				description
			}))
		);
	});

	return { recipeId };
}

export async function updateRecipe(recipeId: string, data: UpdateRecipeModel) {
	await db.transaction(async (tx) => {
		await tx.update(recipes).set(data).where({ id: recipeId });
		await tx.delete(recipeIngredients).where({ recipeId });
		if (!data.ingredients) return;
		await tx.insert(recipeIngredients).values(
			data.ingredients.map((ingredient, index) => ({
				id: crypto.randomUUID(),
				recipeId,
				name: ingredient.name,
				amount: ingredient.amount,
				unit: ingredient.unit
			}))
		);
	});
}

export async function deleteRecipe(recipeId: string) {
	await db.transaction(async (tx) => {
		await tx.delete(recipeIngredients).where({ recipeId });
		await tx.delete(recipes).where({ id: recipeId });
	});
}

export async function getCategories(recipeId?: string) {
	if (recipeId) {
		return await db.select().from(recipeCategories);
	}
	return await db.select().from(categories);
}

// type NewCategory = typeof categories.$inferInsert;

export async function createCategory(name: string, userId: string) {
	const user = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.id, userId))
		.get();

	if (!user) {
		throw new Error('User does not exist');
	}

	const [category] = await db
		.insert(categories)
		.values({
			name,
			createdBy: userId,
			createdAt: new Date()
		})
		.onConflictDoNothing()
		.returning({ id: categories.id });

	return category?.id;
}

export async function deleteCategory(categoryId: string) {
	await db.transaction(async (tx) => {
		await tx
			.delete(recipeCategories)
			.where(eq(recipeCategories.id, categoryId));
		await tx.delete(categories).where(eq(categories.id, categoryId));
	});
}
