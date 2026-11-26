import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

export const users = table('users', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	username: t.text().notNull(),
	role: t.text().$type<'guest' | 'user' | 'admin'>().default('guest')
});

export const recipes = table('recipes', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: t.text().notNull(),
	description: t.text(),
	createdAt: t
		.integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date()),
	updatedAt: t
		.integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date()),
	cookTime: t.integer('cook_time').notNull(),
	prepTime: t.integer('prep_time').notNull(),
	servings: t.integer('servings').notNull(),
	imageUrl: t.text('image_url'),
	notes: t.text(),
	userid: t.text('user_id').references((): AnySQLiteColumn => users.id)
});

export const recipeIngredients = table('recipe_ingredients', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	recipeId: t
		.text('recipe_id')
		.references((): AnySQLiteColumn => recipes.id, { onDelete: 'cascade' }),
	ingredientId: t
		.text('ingredient_id')
		.references((): AnySQLiteColumn => ingredients.id),
	sectionName: t.text('section_name'),
	amount: t.integer().notNull(),
	unit: t.text()
});

export const recipeCategories = table('recipe_categories', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	recipeId: t
		.text('recipe_id')
		.references((): AnySQLiteColumn => recipes.id, { onDelete: 'cascade' }),
	categoryId: t
		.text('category_id')
		.references((): AnySQLiteColumn => categories.id)
});

export const ingredients = table('ingredients', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: t.text().notNull().unique()
});

export const steps = table('steps', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	sectionName: t.text('section_name'),
	stepNr: t.int(),
	description: t.text(),
	recipeId: t
		.text('recipe_id')
		.references((): AnySQLiteColumn => recipes.id, { onDelete: 'cascade' })
});

export const stepImages = table('step_images', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	imageUrl: t.text('image_url').notNull(),
	stepId: t
		.text('step_id')
		.notNull()
		.references((): AnySQLiteColumn => steps.id, { onDelete: 'cascade' })
});

export const categories = table('categories', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: t.text({ length: 50 }).notNull().unique(),
	createdAt: t
		.integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
});

//a user has many recipes
// recipe has: name, date, description, author, steps, ingredients, categories
// steps table or array
// ingredients table or array
// categories table or array
