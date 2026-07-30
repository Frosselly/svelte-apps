<script lang="ts">
	import type { Todo } from '$lib/types';
	import TodoItem from './TodoItem.svelte';

	interface Props {
		todos: Todo[];
	}
	let { todos }: Props = $props();
</script>

<ul class="flex flex-col gap-2">
	{#each todos as todo (todo.id)}
		<li>
			<TodoItem {todo} />
		</li>
	{/each}
</ul>
