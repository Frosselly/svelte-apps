<!-- src/routes/your-route/RecipeStepEditor.svelte -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import 'quill/dist/quill.snow.css';

	interface Props {
		value: string;
		id: string;
		name: string;
		isInvalid: boolean;
	}

	let { value = $bindable(''), id, name, isInvalid }: Props = $props();
	let editorEl: HTMLDivElement;
	let quill: any;

	function handleTextChange() {
		if (quill) {
			value = quill.root.innerHTML;
		}
	}


	onMount(async () => {
		const { default: Quill } = await import('quill');
		quill = new Quill(editorEl, {
			theme: 'snow',
			modules: { toolbar: [['bold', 'italic'], [{ 'color': [] }], ['clean']] },
			placeholder: 'Enter step instructions...'
		});

		if (value) quill.root.innerHTML = value;

		quill.on('text-change', handleTextChange);

		onDestroy(() => {
			if (quill) {
				quill.off('text-change', handleTextChange);
			}
		});
	});
</script>

<div class="quill-wrapper flex-1 ">
	<input type="hidden" {name} {value} />
	<!-- Conditionally append invalid-editor to trigger error styles -->
	<div {id} bind:this={editorEl} class={isInvalid ? 'invalid-editor' : ''}></div>
</div>

<style>
    .quill-wrapper :global(.ql-toolbar),
    .quill-wrapper :global(.ql-container) {
        border-color: rgba(0, 0, 0, 0.1);
    }

    .quill-wrapper :global(.invalid-editor .ql-toolbar),
    .quill-wrapper :global(.invalid-editor .ql-container) {
        border-color: #fca5a5 !important; /* Tailwind's border-red-300 */
        background-color: #ffffbb10;
    }
</style>
