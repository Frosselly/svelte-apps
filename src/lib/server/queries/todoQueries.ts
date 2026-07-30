import type { Todo } from '$lib/types';

export default {
	getTodos,
	createTodo,
	toggleTodo,
	deleteTodo,
	editTodo
};

const db: Map<string, Todo[]> = new Map();

async function getTodos(userid: string) {
	if (!db.get(userid)) {
		db.set(userid, [
			{
				id: crypto.randomUUID(),
				description: 'Learn SvelteKit',
				done: false
			}
		]);
	}
	return db.get(userid);
}

async function editTodo(userid: string, description: string, todoid: string) {
	if (description === '') {
		throw new Error('todo must have a description');
	}
	const todos = db.get(userid);
	if (todos.find((todo: Todo) => todo.description === description)) {
		throw new Error('todos must be unique');
	}
	const index = todos.findIndex((todo: Todo) => todo.id === todoid);
	if (index !== -1) {
		todos[index].description = description;
	}
}
async function createTodo(userid: string, description: string) {
	if (description === '') {
		throw new Error('todo must have a description');
	}
	const todos = db.get(userid);
	if (todos.find((todo: Todo) => todo.description === description)) {
		throw new Error('todos must be unique');
	}
	todos.push({
		id: crypto.randomUUID(),
		description,
		done: false
	});
}

async function deleteTodo(userid: string, todoid: string) {
	const todos = db.get(userid);
	const index = todos?.findIndex((todo: Todo) => todo.id === todoid) ?? -1;

	if (index !== -1) {
		todos.splice(index, 1);
	}
	return;
}

async function toggleTodo(userid: string, todoid: string) {
	const todos = db.get(userid);
	const index = todos?.findIndex((todo: Todo) => todo.id === todoid) ?? -1;
	if (index !== -1) {
		todos[index].completed = !todos[index].completed;
	}
	return;
}
