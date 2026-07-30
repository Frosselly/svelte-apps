<script lang="ts">
	import type { Todo } from '$lib/types';
	import toast from 'svelte-french-toast';
	import { deleteTodo, editTodo, toggleTodo } from './todo.remote';
	import { tick } from 'svelte';
	import DeleteIcon from '$lib/assets/icons/DeleteIcon.svelte';

	interface Props {
		todo: Todo;
	}
	let { todo }: Props = $props();
	let todoid = $derived(todo.id);
	let formVisible = $state(false);
	//svelte-ignore state_referenced_locally
	const editForm = editTodo.for(todoid);
	let todoEditInput: HTMLInputElement | undefined = $state();

	async function handleToggle() {}
	async function handleDelete() {}
	async function showForm() {
		formVisible = true;
		await tick();
		todoEditInput?.focus();
	}
</script>

<div class="w-full max-w-md space-y-4 card preset-filled-surface-100-900 p-4">
	<div class="flex items-center justify-between gap-2">
		<input
			checked={todo.completed}
			onclick={() => toggleTodo(todo.id)}
			type="checkbox"
			class="checkbox"
		/>
		{#if formVisible}
			<form
				class="form"
				{...editForm.enhance(async (form) => {
					try {
						if (await form.submit()) {
							toast.success('Todo changed!');
						} else {
							toast.error('Failed to update todo...');
						}
					} catch (e) {
						toast.error('Something went wrong.');
					}
					formVisible = false;
				})}
			>
				<input {...editForm.fields.todoid.as('hidden', todo.id)} />
				<input
					onfocusout={() => (formVisible = false)}
					bind:this={todoEditInput}
					class="input"
					{...editForm.fields.description.as('text')}
					value={todo.description}
				/>
				<!-- <button class="btn preset-filled-success-100-900">Save</button> -->
			</form>
		{:else}
			<button
				onclick={showForm}
				class="btn w-full hover:preset-filled-surface-100-900"
			>
				<div
					class={`w-full text-left  ${todo.completed ? 'text-surface-800 line-through' : ''}`}
				>
					{todo.description}
				</div>
			</button>
		{/if}
		{#if todo.completed}
			<div class="badge h-min preset-filled-success-500">Completed</div>
		{:else}
			<div class="badge h-min preset-filled-warning-500">Not completed</div>
		{/if}
		<button onclick={() => deleteTodo(todo.id)}>
			<DeleteIcon />
		</button>
	</div>
</div>
