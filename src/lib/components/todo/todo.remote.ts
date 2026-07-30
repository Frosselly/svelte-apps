import { command, form, getRequestEvent, query } from '$app/server';
import db from '$lib/server/database';
import { error, invalid } from '@sveltejs/kit';
import * as v from 'valibot';

export const getTodos = query(async () => {
	const { cookies } = getRequestEvent();
	let id = cookies.get('userid');
	if (!id) {
		return [];
	}
	return await db.getTodos(id);
});

export const createTodo = form(
	v.object({
		description: v.pipe(v.string(), v.nonEmpty('Todo must have a name'))
	}),
	async ({ description }, issue) => {
		const { cookies } = getRequestEvent();
		const id = cookies.get('userid');
		if (!id) error(401, 'Unauthorized');
		try {
			const cleanDescription = description.trim();
			await db.createTodo(id, cleanDescription);
		} catch (e: any) {
			if (e.code === 'NO_DESCRIPTION')
				invalid(issue.description('todo must have a description'));
		}
		void getTodos().refresh();
		return { success: true };
	}
);

export const deleteTodo = command(v.string(), async (todoid) => {
	const { cookies } = getRequestEvent();
	const id = cookies.get('userid');
	if (!id) error(401, 'Unauthorized');
	await db.deleteTodo(id, todoid);
	void getTodos().refresh();
	return;
});

export const toggleTodo = command(v.string(), async (todoid) => {
	const { cookies } = getRequestEvent();
	const id = cookies.get('userid');
	if (!id) error(401, 'Unoauthorized');
	await db.toggleTodo(id, todoid);
	void getTodos().refresh();
	return;
});

export const editTodo = form(
	v.object({
		description: v.pipe(v.string(), v.nonEmpty('Todo must have a name')),
		todoid: v.pipe(v.string(), v.nonEmpty('Todo must have an id'))
	}),
	async ({ description, todoid }, issue) => {
		const { cookies } = getRequestEvent();
		const id = cookies.get('userid');
		if (!id) error(401, 'Unauthorized');
		try {
			const cleanDescription = description.toLowerCase().replace(/ /g, '-');
			await db.editTodo(id, cleanDescription, todoid);
		} catch (e: any) {
			if (e.code === 'NO_DESCRIPTION')
				invalid(issue.description('todo must have a description'));
		}
		void getTodos().refresh();
		return { success: true };
	}
);
