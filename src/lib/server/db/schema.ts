import { sql } from 'drizzle-orm';
import { sqliteTable as table } from 'drizzle-orm/sqlite-core';
import * as t from 'drizzle-orm/sqlite-core';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';

export const task = table('task', {
	id: t
		.text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: t.text('title').notNull(),
	priority: t.integer('priority').notNull().default(1)
});

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
	description: t.text().notNull(),
	category: t.text({ enum: ['dessert', 'dinner'] }),
	createdAt: t.integer('created_at', { mode: 'timestamp' }),
	updatedAt: t.integer('updated_at', { mode: 'timestamp' }),
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
	recipeId: t.text('recipe_id').references((): AnySQLiteColumn => recipes.id),
	ingredientId: t
		.text('ingredient_id')
		.references((): AnySQLiteColumn => ingredients.id),
	amount: t.integer().notNull(),
	unit: t.text().notNull()
});

export const recipeCategories = table('recipe_categories', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	recipeId: t.text('recipe_id').references((): AnySQLiteColumn => recipes.id),
	categoryId: t
		.text('category_id')
		.references((): AnySQLiteColumn => categories.id)
});

export const ingredients = table('ingredients', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: t.text().notNull()
});

export const steps = table('steps', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	stepNr: t.int(),
	description: t.text(),
	recipeId: t.text('recipe_id').references((): AnySQLiteColumn => recipes.id)
});

export const categories = table('categories', {
	id: t
		.text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: t.text({ length: 50 }).notNull().unique(),
	createdBy: t
		.text('created_by')
		.references((): AnySQLiteColumn => users.id)
		.notNull(),
	createdAt: t.integer('created_at', { mode: 'timestamp' }).notNull()
});

//a user has many recipes
// recipe has: name, date, description, author, steps, ingredients, categories
// steps table or array
// ingredients table or array
// categories table or array
