<script lang="ts">
	import AddTodo from '$lib/components/todo/AddTodo.svelte';
	import { getTodos } from '$lib/components/todo/todo.remote';
	import TodoList from '$lib/components/todo/TodoList.svelte';
	import TodoForm from '$lib/components/todoForm.svelte';

	const query = getTodos();
</script>

<main class="w-full max-w-md space-y-4 p-4">
	<h1 class="h1">Create a todo</h1>
	<AddTodo />
	<div class="flex justify-between">
		<h2 class="h2">Your todos</h2>
		<button
			class="btn preset-filled-primary-500"
			onclick={() => getTodos().refresh()}>Refresh</button
		>
	</div>
	<div>
		{#if query.error}
			<p>Oops!</p>
		{:else if query.loading}
			<p>Loading...</p>
		{:else}
			<TodoList todos={query.current} />
		{/if}
	</div>
</main>
