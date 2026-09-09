import type { DbClient } from '$lib/server/db';
import { recipes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { CreateRecipeModel } from '../models';

export async function findRecipe(db: DbClient, id: string) {
	return db.select().from(recipes).where(eq(recipes.id, id)).get();
}

export async function createRecipe(
	db: DbClient,
	data: CreateRecipeModel & { imageUrl: string; id: string }
) {
	return db
		.insert(recipes)
		.values({
			id: data.id,
			title: data.title,
			description: data.description,
			cookTime: data.cookTime,
			prepTime: data.prepTime,
			servings: data.servings,
			imageUrl: data.imageUrl ?? null,
			notes: data.notes ?? null,
			userid: data.userId
		})
		.get();
}
