import { db, type DbClient } from '$lib/server/db';
import { asc, desc, eq, getColumns, like } from 'drizzle-orm';
import type {
	CreateRecipeModel,
	RecipePagingRequest,
	UpdateRecipeModel
} from '../models';
import {
	recipeCategories,
	recipeIngredients,
	recipes,
	steps,
	users
} from '$lib/server/db/schema';
import { recipeSortingKeys } from '../recipeValidation';
import { createRecipe, findRecipe } from '../repositories/recipe.repository';

import { findOrCreateIngredients } from '../repositories/ingredient.repository';
import { findOrCreateCategories } from '../repositories/category.repository';
import { deleteImageFile, saveImage } from './image.service';
import { assignStepNumbers } from '../repositories/steps.repository';

// GET /recipe?searchParams
export async function getRecipes(params?: RecipePagingRequest) {
	console.log('called with: ', params);
	if (!params)
		return await db
			.select({
				...getColumns(recipes),
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
			...getColumns(recipes),
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

// GET /recipe/[id]
export async function getRecipe(recipeId: string) {
	const recipe = await db.query.recipes.findFirst({
		where: { id: recipeId },
		with: {
			ingredients: {
				with: { ingredient: true },
				orderBy: { sectionName: 'asc' }
			},
			steps: { orderBy: [{ sectionName: 'asc' }, { stepNr: 'asc' }] },
			author: true,
			categories: true
		}
	});
	if (!recipe) return null;

	const groupBySection = <T extends { sectionName: string | null }>(
		items: T[]
	) => {
		const map = new Map<string | null, T[]>();
		for (const item of items) {
			const key = item.sectionName;
			if (!map.has(key)) map.set(key, []);
			map.get(key)!.push(item);
		}
		return Array.from(map, ([sectionName, items]) => ({ sectionName, items }));
	};

	return {
		...recipe,
		ingredients: groupBySection(
			recipe.ingredients.map((ri) => ({
				sectionName: ri.sectionName,
				name: ri.ingredient.name,
				amount: ri.amount,
				unit: ri.unit
			}))
		),
		steps: groupBySection(
			recipe.steps.map((s) => ({
				sectionName: s.sectionName,
				description: s.description
			}))
		),
		categories: recipe.categories.map((c) => c.name),
		authorName: recipe.author.name
	};
}

// CREATE /recipe {body}
export async function insertRecipeWithIngredients(
	data: CreateRecipeModel,
	imageFile?: File
) {
	const recipeId = crypto.randomUUID();
	const imageUrl = imageFile ? await saveImage(imageFile, recipeId) : '';

	await db.transaction(async (tx) => {
		await createRecipe(tx, { ...data, id: recipeId, imageUrl });

		const ingredientRows = (
			await findOrCreateIngredients(tx, data.ingredients)
		).map((ingredient) => ({ ...ingredient, recipeId }));
		await tx.insert(recipeIngredients).values(ingredientRows);

		const stepRows = assignStepNumbers(data.steps).map((s) => ({
			id: crypto.randomUUID(),
			recipeId,
			sectionName: s.sectionName,
			stepNr: s.stepNr,
			description: s.description
		}));
		await tx.insert(steps).values(stepRows);

		if (data.categories && data.categories.length > 0) {
			const categoriesRows = (
				await findOrCreateCategories(tx, data.categories)
			).map((c) => ({ ...c, recipeId }));
			await tx.insert(recipeCategories).values(categoriesRows);
		}
	});

	return { recipeId };
}
// PATCH /recipe/[id] {body}
export async function updateRecipe(
	recipeId: string,
	data: UpdateRecipeModel,
	imageFile?: File,
	removeImage?: boolean
) {
	// need the current imageUrl so we know what to clean up, and so we
	// don't lose it when no new file was uploaded
	const current = await findRecipe(db, recipeId);
	if (!current) throw new Error('Recipe not found');

	let imageUrl: string | undefined = undefined; // undefined = "don't touch this column"

	if (imageFile) {
		imageUrl = await saveImage(imageFile, recipeId);
	} else if (removeImage) {
		imageUrl = '';
	}

	await db.transaction(async (rawTx) => {
		const tx = rawTx as unknown as typeof db;

		await tx
			.update(recipes)
			.set({
				...data,
				...(imageUrl !== undefined ? { imageUrl } : {})
			})
			.where(eq(recipes.id, recipeId));

		await tx
			.delete(recipeIngredients)
			.where(eq(recipeIngredients.recipeId, recipeId));
		if (data.ingredients && data.ingredients.length > 0) {
			const ingredientRows = (
				await findOrCreateIngredients(tx, data.ingredients)
			).map((ingredient) => ({ ...ingredient, recipeId }));
			await tx.insert(recipeIngredients).values(ingredientRows);
		}

		await tx.delete(steps).where(eq(steps.recipeId, recipeId));
		if (data.steps && data.steps.length > 0) {
			const stepRows = assignStepNumbers(data.steps).map((s) => ({
				id: crypto.randomUUID(),
				recipeId,
				sectionName: s.sectionName,
				stepNr: s.stepNr,
				description: s.description
			}));
			await tx.insert(steps).values(stepRows);
		}

		await tx
			.delete(recipeCategories)
			.where(eq(recipeCategories.recipeId, recipeId));
		if (data.categories && data.categories.length > 0) {
			const categoriesRows = (
				await findOrCreateCategories(tx, data.categories)
			).map((c) => ({ ...c, recipeId }));
			await tx.insert(recipeCategories).values(categoriesRows);
		}
	});

	// only delete the old file once the DB commit succeeded, and only if it changed
	if (
		imageUrl !== undefined &&
		current.imageUrl &&
		current.imageUrl !== imageUrl
	) {
		await deleteImageFile(current.imageUrl).catch((err) =>
			console.error('Failed to clean up old recipe image', err)
		);
	}
}

// DEL /recipe/[id]
export async function deleteRecipe(recipeId: string) {
	const recipe = await findRecipe(db, recipeId);
	if (!recipe) return; // already gone, nothing to do

	await db.transaction(async (rawTx) => {
		const tx = rawTx as unknown as typeof db;
		await tx.delete(recipes).where(eq(recipes.id, recipeId));
	});

	if (recipe.imageUrl) {
		await deleteImageFile(recipe.imageUrl).catch((err) =>
			console.error('Failed to clean up recipe image', err)
		);
	}
}
