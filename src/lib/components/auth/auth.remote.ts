import { form, getRequestEvent } from '$app/server';
import { login } from '$lib/server/auth';
import * as v from 'valibot';

export const loginUser = form(
	v.object({
		username: v.string()
	}),
	async (data) => {
		const { username } = data;
		console.log('hi', username);
		const user = await login(username);
		const { cookies } = getRequestEvent();
		console.log('user logged in: ', user);
		if (user) {
			cookies.set('username', user.username, { path: '/' });
		}
		return {
			username
		};
	}
);
