import type { DbClient } from '$lib/server/db';
import { recipeIngredients } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function findRecipeIngredients(db: DbClient, recipeId: string) {
	return db
		.select()
		.from(recipeIngredients)
		.where(eq(recipeIngredients.recipeId, recipeId));
}
