import { fail, json } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from '../todo/$types';
import {
	CreateRecipeSchema,
	RecipePagingSchema
} from '$lib/components/recipes/recipeValidation';
import * as v from 'valibot';
import {
	getCategories,
	getRecipe,
	getRecipes,
	insertRecipeWithIngredients
} from '$lib/components/recipes/recipeQueries';
import { me } from '$lib/server/auth';
import { docToRecipe } from '$lib/components/recipe-parser/fromDoc';
import type { Recipe } from '$lib/components/recipes/models';

export const load: PageServerLoad = async ({ url }) => {
	const searchParams = url.searchParams;

	const data: Record<string, any> = {};

	const q = searchParams.get('q');

	if (q) {
		const recipeParams = {
			q,
			offset: Number(searchParams.get('offset')) || undefined,
			pageSize: Number(searchParams.get('pageSize')) || undefined,
			sort: searchParams.get('sort') ?? undefined,
			categories: searchParams.get('categories') ?? undefined
		};

		const result = v.safeParse(RecipePagingSchema, recipeParams);

		if (result.success) {
			data.recipes = await getRecipes(result.output);
		} else {
			// const flattened = v.flatten(result.issues);
			// console.error('Failed to flattened', flattened.nested);
			data.recipes = await getRecipes();
		}
	} else {
		data.recipes = await getRecipes();
		data.categories = await getCategories();
	}

	return data;
};
