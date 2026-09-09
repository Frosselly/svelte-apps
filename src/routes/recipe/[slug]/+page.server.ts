import {
	deleteRecipe,
	getRecipe
} from '$lib/components/recipes/sevices/recipeQueries';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { me } from '$lib/server/auth';
import { findRecipe } from '$lib/components/recipes/repositories/recipe.repository';

export const load: PageServerLoad = async ({ params }) => {
	if (!params.slug) {
		throw new Error('No slug provided');
	}
	const recipe = await getRecipe(params.slug);
	console.log('recici', recipe);
	return { recipe };
};

// [slug]/+page.server.ts
export const actions: Actions = {
	delete: async ({ params, cookies }) => {
		const username = cookies.get('username');
		if (!username) return fail(401, { message: 'Unauthorized' });
		const { id: userid } = await me(username);

		const recipe = await getRecipe(params.slug);
		if (!recipe) return fail(404, { message: 'Recipe not found' });
		if (recipe.userid !== userid)
			return fail(403, { message: 'Not your recipe' });

		try {
			await deleteRecipe(params.slug);
		} catch (e) {
			console.error('Failed to delete recipe', e);
			return fail(500, { message: 'Failed to delete recipe' });
		}

		throw redirect(303, '/recipe');
	}
};
