// // import * as db from '$lib/server/database.js';

export function load({ cookies }) {
	let id = cookies.get('userid');

	if (!id) {
		id = crypto.randomUUID();
		cookies.set('userid', id, { path: '/' });
		console.log('new user', id);
	}
	console.log('old user', id);
}

// export const actions = {
// 	POST: async ({ request }) => {
// 		const data = await request.formData();
// 		// db.createTodo(cookies.get('userid'), data.get('description'));
// 	},
// 	PATCH: async ({ request }) => {
// 		const data = await request.formData();
// 		// db.createTodo(cookies.get('userid'), data.get('description'));
// 	},
// 	DELETE: async ({ request }) => {
// 		const data = await request.formData();
// 		// db.createTodo(cookies.get('userid'), data.get('description'));
// 	}
// };
