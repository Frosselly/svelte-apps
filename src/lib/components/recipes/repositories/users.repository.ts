import type { DbClient } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function findUser(db: DbClient, userId: string) {
	return db
		.select({ name: users.username })
		.from(users)
		.where(eq(users.id, userId))
		.get();
}
