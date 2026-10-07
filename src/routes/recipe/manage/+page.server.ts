import { fail, json, type Actions } from '@sveltejs/kit';
import {
	CreateRecipeSchema,
	RecipePagingSchema,
	UpdateRecipeSchema
} from '$lib/components/recipes/recipeValidation';
import * as v from 'valibot';
import { me } from '$lib/server/auth';
import { docToRecipe } from '$lib/components/recipe-parser/fromDoc';
import type { Recipe } from '$lib/components/recipes/models';
import DOMPurify from 'isomorphic-dompurify';
import {
	getRecipe,
	insertRecipeWithIngredients,
	updateRecipe
} from '$lib/components/recipes/sevices/recipeQueries';
import type { PageServerLoad } from './$types';

function normalizeSection(raw: FormDataEntryValue | null): string | undefined {
	if (raw === null) return undefined;
	const trimmed = String(raw).trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function parseRecipeFormData(formData: FormData, userid: string) {
	const rawIngredients: {
		originalIndex: number;
		sectionName?: string;
		name: string;
		amount: number;
		unit?: string;
	}[] = [];
	for (let i = 0; ; i++) {
		const nameRaw = formData.get(`ingredients[${i}].name`);
		if (nameRaw === null) break;
		const unitRaw = formData.get(`ingredients[${i}].unit`);
		rawIngredients.push({
			originalIndex: i,
			sectionName: normalizeSection(
				formData.get(`ingredients[${i}].sectionName`)
			),
			name: String(nameRaw).trim(),
			amount: Number(formData.get(`ingredients[${i}].amount`)),
			unit: unitRaw === null ? undefined : String(unitRaw).trim() || undefined
		});
	}
	const keptIngredients = rawIngredients.filter((r) => r.name !== '' || r.unit);

	const rawSteps: {
		originalIndex: number;
		sectionName?: string;
		description: string;
	}[] = [];

	for (let i = 0; ; i++) {
		const descRaw = formData.get(`steps[${i}].description`);
		if (descRaw === null) break;
		rawSteps.push({
			originalIndex: i,
			sectionName: normalizeSection(formData.get(`steps[${i}].sectionName`)),
			//Sanitize description generated with Quill
			description: DOMPurify.sanitize(String(descRaw).trim())
		});
	}
	const keptSteps = rawSteps.filter((s) => {
		if (!s.description) return false;

		// Strip out all HTML tags (like <p>, <br>, </p>) using a fast regex
		const plainText = s.description.replace(/<[^>]*>/g, '').trim();

		// Only keep the step if it contains actual words or characters
		return plainText !== '';
	});

	return {
		rawData: {
			title: formData.get('title'),
			description: formData.get('description') || undefined,
			categories: formData.getAll('categories[]').map(String),
			cookTime: Number(formData.get('cookTime')),
			prepTime: Number(formData.get('prepTime')),
			servings: Number(formData.get('servings')),
			notes: formData.get('notes') || undefined,
			ingredients: keptIngredients.map(({ originalIndex, ...rest }) => rest),
			steps: keptSteps.map(({ originalIndex, ...rest }) => rest),
			userId: userid
		},
		ingredientIndexMap: keptIngredients.map((r) => r.originalIndex),
		stepIndexMap: keptSteps.map((s) => s.originalIndex)
	};
}

function remapIndices(
	errors: Record<string, string[]>,
	ingredientMap: number[],
	stepMap: number[]
) {
	const remapped: Record<string, string[]> = {};
	for (const [key, messages] of Object.entries(errors)) {
		const ingredientMatch = key.match(/^ingredients\.(\d+)(\..+)?$/);
		const stepMatch = key.match(/^steps\.(\d+)(\..+)?$/); // now captures trailing field too

		if (ingredientMatch) {
			const filteredIdx = Number(ingredientMatch[1]);
			const rest = ingredientMatch[2] ?? '';
			const originalIdx = ingredientMap[filteredIdx];
			remapped[`ingredients.${originalIdx}${rest}`] = messages;
		} else if (stepMatch) {
			const filteredIdx = Number(stepMatch[1]);
			const rest = stepMatch[2] ?? '';
			const originalIdx = stepMap[filteredIdx];
			remapped[`steps.${originalIdx}${rest}`] = messages;
		} else {
			remapped[key] = messages;
		}
	}
	return remapped;
}

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

export const actions: Actions = {
	post: async ({ cookies, request }) => {
		const formData = await request.formData();
		const username = cookies.get('username');
		if (!username) return fail(401, { message: 'Unauthorized' });
		const { id: userid } = await me(username);

		const { rawData, ingredientIndexMap, stepIndexMap } = parseRecipeFormData(
			formData,
			userid
		);
		const result = v.safeParse(CreateRecipeSchema, rawData);

		if (!result.success) {
			const flattened = v.flatten(result.issues);
			console.log(flattened);
			const remappedErrors = remapIndices(
				flattened.nested ?? {},
				ingredientIndexMap,
				stepIndexMap
			);
			console.log(remappedErrors);

			return fail(400, {
				errors: remappedErrors,
				rootErrors: flattened.root ?? [],
				data: rawData
			});
		}

		try {
			const imageFile = formData.get('image');
			const { recipeId } = await insertRecipeWithIngredients(
				result.output,
				imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined
			);
			return { success: true, recipeId };
		} catch (e) {
			console.error('Failed to insert recipe', e);
			return fail(500, { success: false, message: 'Failed to insert recipe' });
		}
	},
	patch: async ({ cookies, request }) => {
		const formData = await request.formData();
		const username = cookies.get('username');
		if (!username) return fail(401, { message: 'Unauthorized' });
		const { id: userid } = await me(username);

		const recipeId = formData.get('recipeId');
		if (typeof recipeId !== 'string' || !recipeId) {
			return fail(400, { message: 'Missing recipeId' });
		}

		const { rawData, ingredientIndexMap, stepIndexMap } = parseRecipeFormData(
			formData,
			userid
		);
		const result = v.safeParse(UpdateRecipeSchema, rawData);
		if (!result.success) {
			const flattened = v.flatten(result.issues);
			const remappedErrors = remapIndices(
				flattened.nested ?? {},
				ingredientIndexMap,
				stepIndexMap
			);
			return fail(400, {
				errors: remappedErrors,
				rootErrors: flattened.root ?? [],
				data: rawData
			});
		}

		try {
			console.log('update rec:', recipeId, result.output);
			const imageFile = formData.get('image');
			// const removeImage = formData.get('removeImage') === 'true';

			await updateRecipe(
				recipeId,
				result.output,
				imageFile instanceof File && imageFile.size > 0 ? imageFile : undefined,
				true
			);

			return { success: true, recipeId };
		} catch (e) {
			console.error('Failed to update recipe', e);
			return fail(500, { success: false, message: 'Failed to update recipe' });
		}
	}
};
