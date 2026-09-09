import type { DbClient } from '$lib/server/db';
import { categories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function findOrCreateCategories(db: DbClient, names: string[]) {
	const existing = await db.query.categories.findMany({
		where: { name: { in: names } }
	});
	const byName = new Map(existing.map((c) => [c.name, c]));

	const toCreate = names.filter((n) => !byName.has(n));
	if (toCreate.length) {
		const newRows = toCreate.map((name) => ({
			id: crypto.randomUUID(),
			name
		}));
		await db.insert(categories).values(newRows);
		newRows.forEach((r) => byName.set(r.name, r));
	}

	return names.map((name) => ({ categoryId: byName.get(name)!.id }));
}
