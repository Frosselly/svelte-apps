import * as v from 'valibot';
import {
	recipes as recipeDBSchema,
	recipeIngredients as recipeIngredientDBSchema,
	steps as stepsDBSchema
} from '$lib/server/db/schema';

import {
	CreateRecipeSchema,
	RecipePagingSchema,
	UpdateRecipeSchema
} from './recipeValidation';

export interface Ingredient {
	name: string;
	amount: number;
	unit: string;
}

export type RecipePagingRequest = v.InferOutput<typeof RecipePagingSchema>;

export type CreateRecipeModel = v.InferOutput<typeof CreateRecipeSchema>;
export type UpdateRecipeModel = v.InferOutput<typeof UpdateRecipeSchema>;

export interface PagingResponse {
	page: number;
	limit: number;
	total: number;
	items: any[];
	query: object;
}
export type Recipe = typeof recipeDBSchema.$inferSelect & {
	ingredients: Ingredient[];
	steps: string[];
	categories: string[];
	author: { username: string };
};

// export interface CreateRecipeModel {
// 	title: string;
// 	description?: string;
// 	servings?: number;
// 	image?: File;
// 	cookTime: number;
// 	prepTime: number;
// 	notes?: string;
// 	ingredients: Ingredient[];
// 	steps: string[];
// 	userId: string;
// 	category?: 'dessert' | 'dinner';
// }
