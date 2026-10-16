<script lang="ts">
	import AddRecipe from '$lib/components/recipes/AddRecipe.svelte';
	import * as docx from 'docx-preview';

	const { form, data } = $props();

	const recipeToEdit = $derived(data.editId ? data.recipeToEdit : null);

	let docContainer = $state();
	let mobileDocContainer = $state();
	let docFile = $state();
	let showMobilePreview = $state(false);

	$effect(() => {
		if (!docFile) return;
		showMobilePreview = true;
		for (const target of [docContainer, mobileDocContainer]) {
			if (target)
				docx.renderAsync(docFile, target, undefined, { inWrapper: false });
		}
	});
</script>

<main class="flex flex-col gap-8 lg:flex-row lg:gap-12">
	<section class="w-full max-w-full">
		<AddRecipe
			bind:docFile
			{recipeToEdit}
			{form}
			categories={data.categories}
		/>
	</section>

	<!-- Desktop side-by-side preview -->
	<section class="hidden h-min w-full max-w-full overflow-hidden p-4 lg:block">
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

<!-- Mobile overlay preview -->
{#if docFile && showMobilePreview}
	<div
		class="fixed inset-0 z-50 flex flex-col justify-end bg-ink/40 backdrop-blur-sm lg:hidden"
	>
		<div
			class="flex max-h-[80vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-lg"
		>
			<div
				class="flex shrink-0 items-center justify-between border-b border-ink/10 px-4 py-3"
			>
				<h3 class="text-sm font-semibold text-ink">Doc Preview</h3>
				<button
					type="button"
					aria-label="Close preview"
					onclick={() => (showMobilePreview = false)}
					class="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-blush-100 hover:text-blush-500"
				>
					✕
				</button>
			</div>
			<div class="overflow-y-auto p-4">
				<div bind:this={mobileDocContainer} class="bg-white"></div>
			</div>
		</div>
	</div>
{/if}

<!-- Reopen button if dismissed but a doc is still loaded -->
{#if docFile && !showMobilePreview}
	<button
		type="button"
		onclick={() => (showMobilePreview = true)}
		class="fixed right-4 bottom-24 z-40 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-cream shadow-lg transition-transform hover:-translate-y-0.5 lg:hidden"
	>
		View doc preview
	</button>
{/if}
