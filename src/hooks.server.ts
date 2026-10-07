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

export const handleError: HandleServerError = ({ kind, error }) => {
	if (kind === 'unknown') {
		if (error instanceof NotFound) {
			return {
				status: 404,
				message: 'Not found'
			};
		}

		return { message: 'Something went wrong' };
	}

	if (kind === 'app') {
		return error;
	}

	const errorId = crypto.randomUUID();

	if (kind === 'framework') {
		return { ...error, errorId };
	}

	return error;
};
