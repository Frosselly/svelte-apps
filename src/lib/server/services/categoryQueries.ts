import { db } from '$lib/server/db';

export async function getCategories() {
	return await db.query.categories.findMany();
}
