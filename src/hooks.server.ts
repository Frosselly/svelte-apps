// import type { RequestEvent } from '@sveltejs/kit';

// export function load(cookies) {
// 	let id = cookies.get('userid');
// 	if (!id) {
// 		id = crypto.randomUUID();
// 		cookies.set('userid', id, { path: '/' });
// 		console.log('new user', id);
// 	}
// 	console.log('old user', id);
// 	return {
// 		// todos: db.getTodos(id)
// 	};
// }
import type { HandleServerError } from '@sveltejs/kit';

class NotFound extends Error {}

export const handleError: HandleServerError = ({ error }) => {
	const errorId = crypto.randomUUID();
	console.error(errorId, error);
	return { message: 'Something went wrong', errorId };
};
