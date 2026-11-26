import { fail, redirect, type Actions, error } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { me } from '$lib/server/auth';
import { deleteRecipe, getRecipe } from '$lib/server/services/recipeQueries';

export const load: PageServerLoad = async ({ params }) => {
	if (!params.slug) {
		error(400, 'No slug provided'); // Native 400 Bad Request
	}

	const recipe = await getRecipe(params.slug);
	console.log('recipe:', recipe);

	// If the recipe wasn't found in the database (null or undefined)
	if (!recipe) {
		error(404, {
			message: 'Recipe not found'
		});
	}

	// Double-check: If recipe is an ORM class instance (e.g., Prisma/Mongoose),
	// ensure it's converted to a POJO using structuredClone or a custom mapper
	return {
		recipe: structuredClone(recipe)
	};
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
