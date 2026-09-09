import type { DbClient } from '$lib/server/db';
import { ingredients } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function findOrCreateIngredients(db: DbClient, items: any[]) {
	const names = items.map((i) => i.name);
	const existing: (typeof ingredients.$inferSelect)[] =
		await db.query.ingredients.findMany({
			where: { name: { in: names } }
		});
	const byName = new Map(existing.map((e) => [e.name, e]));
	const toCreate = items.filter((i) => !byName.has(i.name));

	if (toCreate.length > 0) {
		const newRows = toCreate.map((i) => ({
			id: crypto.randomUUID(),
			name: i.name
		}));
		await db.insert(ingredients).values(newRows);
		newRows.forEach((r) => byName.set(r.name, r));
	}

	return items.map((i) => ({
		sectionName: i.sectionName,
		id: crypto.randomUUID(),
		ingredientId: byName.get(i.name)!.id,
		amount: i.amount,
		unit: i.unit
	}));
}
