import { login } from '$lib/server/auth';

export const load = async ({ cookies, locals }) => {
	console.log('layout load');
	const username = cookies.get('username');
	console.log('layout user:', username);

	return { username };
};
