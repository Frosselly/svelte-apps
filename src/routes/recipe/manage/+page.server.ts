import { fail, json } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from '../todo/$types';
import {
	CreateRecipeSchema,
	RecipePagingSchema
} from '$lib/components/recipes/recipeValidation';
import * as v from 'valibot';
import {
	getRecipe,
	getRecipes,
	insertRecipeWithIngredients
} from '$lib/components/recipes/recipeQueries';
import { me } from '$lib/server/auth';
import { docToRecipe } from '$lib/components/recipe-parser/fromDoc';
import type { Recipe } from '$lib/components/recipes/models';

export const load: PageServerLoad = async ({ url }) => {
	const searchParams = url.searchParams;

	const editId = searchParams.get('editId');

	const data: Record<string, any> = {};

	if (editId) {
		data.recipeToEdit = await getRecipe(editId);
		console.log('rce serve', data.recipeToEdit);
		data.editId = editId;
	}



	return data;
};

export const actions = {
	parseDoc: async ({ request }) => {
		const formData = await request.formData();
		const file = formData.get('file') as File;
		if (!file || !file.name) return fail(400, { message: 'No file selected' });
		console.log('file file', file);
		try {
			const recipeRes = await docToRecipe(file);
			if (recipeRes) {
				const recipeClean: Partial<Recipe> = {
					title: recipeRes.title ?? '',
					description: recipeRes.description ?? '',
					ingredients: recipeRes.ingredients ?? [],
					cookTime: recipeRes.cookTime ?? 0,
					prepTime: recipeRes.prepTime ?? 0,
					servings: recipeRes.servings ?? 0,
					steps: recipeRes.steps ?? []
				};
				console.log('recipeClean', recipeClean);
				return recipeClean;
			} else {
				return fail(400, { message: 'No recipe found' });
			}
		} catch (err) {
			console.error('Failed to parse doc', err);
			return fail(500, { message: 'Failed to parse doc' });
		}

		// console.log('recipeRes', recipeRes);
		// if (recipeRes.ok) {
		// 	return recipeRes.json();
		// }
	},
	get: async (event) => {
		console.log('get sent', event);
	},
	post: async ({ cookies, request, locals }) => {
		console.log('post sent');
		const formData = await request.formData();

		const parsedIngredients = [];

		for (let i = 0; ; i++) {
			const name = formData.get(`ingredients[${i}].name`);
			if (!name) break;
			const amount = Number(formData.get(`ingredients[${i}].amount`));
			const unit = formData.get(`ingredients[${i}].unit`);
			parsedIngredients.push({ name, amount, unit });
		}

		console.log('parsedIngredients', parsedIngredients);

		const cookTime =
			Number(formData.get('cookTime-H')) * 60 +
			Number(formData.get('cookTime-M'));
		const prepTime =
			Number(formData.get('prepTime-H')) * 60 +
			Number(formData.get('prepTime-M'));
		const username = cookies.get('username');
		if (!username) return fail(401, { message: 'Unauthorized' });
		const { id: userid } = await me(username);

		const rawData = {
			title: formData.get('title'),
			description: formData.get('description'),
			category: formData.get('category'),
			cookTime: cookTime,
			prepTime: prepTime,
			servings: Number(formData.get('servings')),
			notes: formData.get('notes') || undefined,
			ingredients: parsedIngredients,
			steps: formData.getAll('steps[]'),
			userId: userid
		};
		console.log(Object.fromEntries(formData));
		console.log('rawData', rawData);

		const result = v.safeParse(CreateRecipeSchema, rawData);
		console.log('result.success', result.success);

		if (!result.success) {
			const flattened = v.flatten(result.issues);
			console.error('Failed to flattened', flattened.nested);

			return fail(400, {
				errors: flattened.nested ?? {},
				rootErrors: flattened.root ?? [],
				data: rawData
			});
		}

		try {
			const { recipeId } = await insertRecipeWithIngredients(result.output);
			return { success: true, recipeId };
		} catch (e) {
			console.error('Failed to insert recipe', e);

			return fail(500, { success: false, message: 'Failed to insert recipe' });
		}
	},
	patch: async (event) => {},
	delete: async (event) => {}
} satisfies Actions;
