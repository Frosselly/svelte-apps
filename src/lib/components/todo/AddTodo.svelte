<script lang="ts">
	import { enhance } from '$app/forms';
	import toast from 'svelte-french-toast';
	import { createTodo } from './todo.remote';

	interface Props {
		onsubmit?: (taskName: string) => void;
	}

	const { onsubmit }: Props = $props();
</script>

<form
	class="flex w-full max-w-md space-y-4"
	{...createTodo.enhance(async (form) => {
		try {
			if (await form.submit()) {
				form.element.reset();
				toast.success('New task added successfully!');
			} else {
				toast.error('Invalid data!');
			}
		} catch (e) {
			toast.error('Something went wrong!');
		}
	})}
>
	<fieldset class="w-full">
		<div>
			<label class="label" for="new-task">
				<span class="label-text">Your next task</span>
				<div class="flex gap-2">
					<input
						class="input w-full"
						{...createTodo.fields.description.as('text')}
						oninput={() => createTodo.validate()}
						placeholder="New task name"
					/>
					<button type="submit" class="btn preset-outlined-surface-300-700"
						>Add task</button
					>
				</div>
			</label>
		</div>
		{#each createTodo.fields.description.issues() as issue (issue.message)}
			<p class="issue">{issue.message}</p>
		{/each}
	</fieldset>
</form>
