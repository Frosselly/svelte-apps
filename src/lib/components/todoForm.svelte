<script lang="ts">
	import { enhance } from '$app/forms';
	import toast from 'svelte-french-toast';
	interface Props {
		onsubmit?: (taskName: string) => void;
	}

	let newTaskName = $state('');
	const { onsubmit }: Props = $props();
</script>

<label for="new-task">Your next task</label>
<input
	bind:value={newTaskName}
	type="text"
	id="new-task"
	name="new-task"
	placeholder="New task name"
/>
<button
	onclick={() => {
		onsubmit?.(newTaskName);
		toast.success('New task added successfully!');
	}}>Add task</button
>
