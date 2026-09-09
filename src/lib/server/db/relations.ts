import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
	recipes: {
		ingredients: r.many.recipeIngredients({
			from: r.recipes.id,
			to: r.recipeIngredients.recipeId
		}),
		steps: r.many.steps({
			from: r.recipes.id,
			to: r.steps.recipeId
		}),
		author: r.one.users({
			from: r.recipes.userid,
			to: r.users.id
		}),
		categories: r.many.categories({
			from: r.recipes.id.through(r.recipeCategories.recipeId),
			to: r.categories.id.through(r.recipeCategories.categoryId)
		})
	},
	recipeIngredients: {
		recipe: r.one.recipes({
			from: r.recipeIngredients.recipeId,
			to: r.recipes.id
		}),
		ingredient: r.one.ingredients({
			from: r.recipeIngredients.ingredientId,
			to: r.ingredients.id
		})
	},
	categories: {
		recipes: r.many.recipes({
			from: r.categories.id.through(r.recipeCategories.categoryId),
			to: r.recipes.id.through(r.recipeCategories.recipeId)
		})
	}
}));
