<script lang="ts">
	import AddRecipe from '$lib/components/recipes/AddRecipe.svelte';
	import * as docx from 'docx-preview';

	const { data } = $props();

	const recipeToEdit = $derived(data.editId ? data.recipeToEdit : null);

	let docContainer = $state();
	let docFile = $state();

	$effect(() => {
		if (!docFile) return;
		docx
			.renderAsync(docFile, docContainer, undefined, {
				inWrapper: false
			})
			.then((x) => console.log('docx: finished'));
	});
</script>

<main class="flex gap-12">
	<section class="max-w w-full">
		<AddRecipe bind:docFile {recipeToEdit} />
	</section>
	<section class="max-w h-min w-full overflow-hidden p-4">
		<h3 class="h3">Doc Preview</h3>
		<div class="h-full w-full border text-center">
			{#if !docFile}
				<div class="py-54">Here doc/docx preview will be shown</div>
			{:else}
				<div bind:this={docContainer} class="bg-white"></div>
			{/if}
		</div>
	</section>
</main>
