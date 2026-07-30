import { eq } from 'drizzle-orm';
import { db } from './db';
import { users } from './db/schema';

export async function login(username: string) {
	try {
		let user = await db
			.select()
			.from(users)
			.where(eq(users.username, username));

		if (user.length === 0) {
			user = await db.insert(users).values({ username }).returning();
		}

		return user[0];
	} catch (e) {
		console.error('login error', e);
		throw e;
	}
}

export async function me(username: string) {
	try {
		const user = await db
			.select()
			.from(users)
			.where(eq(users.username, username));
		return user[0];
	} catch (e) {
		console.error('login error', e);
		throw e;
	}
}
