<script lang="ts">
	import { deserialize, enhance } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { CreateRecipeModel, Recipe } from './models';
	import TimeStepper from './TimeStepper.svelte';
	import NumberStepper from './NumberStepper.svelte';
	import type { PageProps } from '../../../routes/recipe/manage/$types';

	type PropsType = Partial<PageProps> & {
		recipeToEdit?: Recipe;
		docFile: File | undefined;
	};

	let { form, docFile = $bindable(), recipeToEdit }: PropsType = $props();
	let submitting = $state(false);

	const recipeDefault: Omit<CreateRecipeModel, 'userId'> = {
		title: '',
		description: '',
		categories: ['dinner'],
		ingredients: [{ name: '', amount: 1, unit: '' }],
		steps: [{ description: '' }], // was ['']
		prepTime: 0,
		cookTime: 0,
		servings: 4,
		notes: ''
	};

	let recipe = $state(structuredClone(recipeToEdit ?? recipeDefault));

	$effect(() => {
		recipe = structuredClone(recipeToEdit ?? recipeDefault);
		newImagePreview = null;
	});

	let newImagePreview: string | null = $state(null);
	const imagePreview = $derived(
		newImagePreview ?? recipeToEdit?.imageUrl ?? null
	);

	function handleImageChange(
		event: Event & { currentTarget: HTMLInputElement }
	) {
		const file = event.currentTarget.files?.[0];
		if (file) newImagePreview = URL.createObjectURL(file);
	}

	async function handleFileSelect(
		event: Event & { currentTarget: HTMLInputElement }
	) {
		const file = event.currentTarget.files?.[0];
		if (!file) return;
		docFile = file; // pass file to parent

		const formData = new FormData();
		formData.append('file', file);

		const res = await fetch('?/parseDoc', { method: 'POST', body: formData });
		if (res.ok) {
			const result: ActionResult = deserialize(await res.text());
			if (result.type === 'success' && result.data) {
				recipe = { ...recipe, ...result.data };
			}
		}
	}

	let importUrl = $state('');
	async function handleURLSubmit(event: SubmitEvent) {
		event.preventDefault();
		// TODO: wire up to a real ?/parseUrl action, same shape as handleFileSelect.
	}

	function createRandomRecipe() {
		recipe = structuredClone({
			title: 'Skillet Lemon Garlic Chicken',
			description: 'Weeknight chicken thighs in a bright, garlicky pan sauce.',
			categories: 'dinner',
			ingredients: [
				{
					sectionName: 'For the chicken',
					name: 'boneless chicken thighs',
					amount: 4,
					unit: ''
				},
				{
					sectionName: 'For the chicken',
					name: 'garlic, minced',
					amount: 3,
					unit: 'cloves'
				},
				{
					sectionName: 'For the sauce',
					name: 'lemon, juiced',
					amount: 1,
					unit: ''
				},
				{
					sectionName: 'For the sauce',
					name: 'chicken stock',
					amount: 0.5,
					unit: 'cup'
				}
			],
			steps: [
				{
					sectionName: 'Prep',
					description:
						'Season the chicken thighs with salt and pepper on both sides.'
				},
				{
					sectionName: 'Cook',
					description:
						'Sear in a hot skillet, 5 minutes per side, then set aside.'
				},
				{
					sectionName: 'Cook',
					description:
						'Add garlic to the pan and cook until fragrant, about 30 seconds.'
				},
				{
					sectionName: 'Cook',
					description:
						'Deglaze with lemon juice and stock, return chicken, and simmer 8 minutes.'
				}
			],
			prepTime: 10,
			cookTime: 20,
			servings: 4
		} satisfies Omit<CreateRecipeModel, 'userId'>);
	}

	function fieldError(path) {
		return form?.errors?.[path]?.[0];
	}

	$effect(() => {
		console.log('form?.errors', form?.errors);
	});
</script>

<div
	class="mx-auto flex w-full max-w-3xl flex-col gap-8 bg-cream px-4 py-10 pb-28"
>
	<div class="flex items-start justify-between gap-4">
		<div>
			<h1 class="font-display text-3xl font-semibold text-ink">
				{recipeToEdit ? 'Edit recipe' : 'New recipe'}
			</h1>
			<p class="font-script text-xl text-blush-500">
				{recipeToEdit ? 'touch it up' : 'add one worth keeping'}
			</p>
		</div>
		<button
			type="button"
			onclick={createRandomRecipe}
			class="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-blush-100"
		>
			Fill with sample data
		</button>
	</div>

	{#if form?.rootErrors?.length}
		<div
			id="form-errors"
			class="flex flex-col gap-1 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
			role="alert"
		>
			{#each form.rootErrors as err}
				<p>{err}</p>
			{/each}
		</div>
	{/if}

	{#if !recipeToEdit}
		<section
			class="flex flex-col gap-4 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-ink/5"
		>
			<h2 class="font-display text-lg font-semibold text-ink">Quick import</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<label
					for="doc-import"
					class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-ink/15 bg-blush-100/40 px-4 py-6 text-center transition-colors hover:border-blush-500/40 hover:bg-blush-100"
				>
					<span class="text-sm font-medium text-ink">From a document</span>
					<span class="text-xs text-ink-soft">.docx or .pdf</span>
					<input
						id="doc-import"
						type="file"
						class="sr-only"
						onchange={handleFileSelect}
					/>
				</label>

				<form
					onsubmit={handleURLSubmit}
					class="flex flex-col justify-center gap-2 rounded-2xl border border-ink/15 px-4 py-4"
				>
					<label for="url-import" class="text-sm font-medium text-ink"
						>From a URL</label
					>
					<div class="flex gap-2">
						<input
							id="url-import"
							type="url"
							bind:value={importUrl}
							placeholder="https://..."
							class="w-full rounded-xl border border-ink/10 bg-white px-3 py-1.5 text-sm text-ink placeholder:text-ink-soft/50 focus:border-blush-500/50 focus:outline-none"
						/>
						<button
							type="submit"
							class="shrink-0 rounded-xl bg-ink px-3 py-1.5 text-xs font-semibold text-cream"
						>
							Import
						</button>
					</div>
				</form>
			</div>
		</section>
	{/if}

	<form
		method="POST"
		action={recipeToEdit ? '?/patch' : '?/post'}
		enctype="multipart/form-data"
		class="flex w-full flex-col gap-6"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
				if (
					form?.rootErrors?.length ||
					(form?.errors && Object.keys(form.errors).length)
				) {
					document
						.getElementById('form-errors')
						?.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			};
		}}
	>
		{#if recipeToEdit}
			<input type="hidden" name="recipeId" value={recipeToEdit.id} />
		{/if}
		<!-- Basics -->
		<section
			class="flex flex-col gap-5 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-ink/5"
		>
			<h2 class="font-display text-lg font-semibold text-ink">The basics</h2>

			<label
				for="title"
				class="flex flex-col gap-1.5 text-sm font-medium text-ink"
			>
				Title
				<input
					name="title"
					id="title"
					type="text"
					required
					bind:value={recipe.title}
					class="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-blush-500/50 focus:ring-2 focus:ring-blush-300/50 focus:outline-none"
				/>
				{#if fieldError('title')}
					<span id="title-error" class="text-xs font-medium text-red-600"
						>{fieldError('title')}</span
					>
				{/if}
			</label>

			<label
				for="description"
				class="flex flex-col gap-1.5 text-sm font-medium text-ink"
			>
				Description
				<textarea
					name="description"
					id="description"
					rows="3"
					bind:value={recipe.description}
					class="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-blush-500/50 focus:ring-2 focus:ring-blush-300/50 focus:outline-none"
				></textarea>
			</label>

			<div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
				<label
					for="categories[]"
					class="flex flex-col gap-1.5 text-sm font-medium text-ink"
				>
					Category
					<div class="flex items-center">
						<input
							id="default-checkbox"
							type="checkbox"
							name="categories[]"
							value="dessert"
							class="border-default-medium bg-neutral-secondary-medium focus:ring-brand-soft h-4 w-4 rounded-xs border focus:ring-2"
						/>
						<label
							for="default-checkbox"
							class="text-heading ms-2 text-sm font-medium select-none"
							>Dessert</label
						>
					</div>
					<div class="flex items-center">
						<input
							id="default-checkbox"
							type="checkbox"
							name="categories[]"
							value="dinner"
							class="border-default-medium bg-neutral-secondary-medium focus:ring-brand-soft h-4 w-4 rounded-xs border focus:ring-2"
						/>
						<label
							for="default-checkbox"
							class="text-heading ms-2 text-sm font-medium select-none"
							>Dinner</label
						>
					</div>
					<!-- <select
						name="category"
						id="category"
						required
						bind:value={recipe.category}
						class="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-blush-500/50 focus:ring-2 focus:ring-blush-300/50 focus:outline-none"
					>
						<option value="dinner">Dinner</option>
						<option value="dessert">Dessert</option>
					</select> -->
				</label>

				<div class="flex flex-col gap-1.5 text-sm font-medium text-ink">
					Photo
					<label
						for="image"
						class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-ink/15 px-3 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-blush-500/40 hover:bg-blush-100/40"
					>
						{#if imagePreview}
							<img
								src={imagePreview}
								alt="Preview"
								class="h-10 w-10 rounded-lg object-cover"
							/>
						{/if}
						{imagePreview ? 'Replace photo' : 'Upload a photo (optional)'}
						<input
							id="image"
							name="image"
							type="file"
							accept="image/*"
							class="sr-only"
							onchange={handleImageChange}
						/>
					</label>
				</div>
			</div>
		</section>

		<!-- Timing & yield -->
		<section
			class="flex flex-col gap-5 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-ink/5"
		>
			<h2 class="font-display text-lg font-semibold text-ink">
				Timing & yield
			</h2>
			<div
				class="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3"
			>
				<TimeStepper
					legend="Prep time"
					name="prepTime"
					value={recipe.prepTime}
					onchange={(v) => (recipe.prepTime = v)}
				/>
				<TimeStepper
					legend="Cook time"
					name="cookTime"
					value={recipe.cookTime}
					onchange={(v) => (recipe.cookTime = v)}
				/>
				<div class="flex flex-col items-start gap-2">
					<span class="mb-1 text-sm font-medium text-ink">Servings</span>
					<NumberStepper
						id="servings"
						name="servings"
						label="Servings"
						value={recipe.servings}
						min={1}
						max={50}
						suffix="ppl"
						onchange={(v) => (recipe.servings = v)}
					/>
				</div>
			</div>
		</section>

		<!-- Ingredients -->
		<section
			class="flex flex-col gap-4 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-ink/5"
		>
			<h2 class="font-display text-lg font-semibold text-ink">Ingredients</h2>
			{#if form?.ingredients}
				<p class="text-xs font-medium text-blush-500">
					Check your ingredient rows below.
				</p>
			{/if}

			<div class="flex flex-col gap-3">
				{#each recipe.ingredients as _, idx ('ingredientIdx-' + idx)}
					{@const showSectionHeader =
						idx === 0 ||
						recipe.ingredients[idx - 1].sectionName !==
							recipe.ingredients[idx].sectionName}
					{#if showSectionHeader}
						<div class="mt-2 flex items-center gap-2 first:mt-0">
							<input
								type="text"
								placeholder="Section name (e.g. For the sauce)"
								value={recipe.ingredients[idx].sectionName ?? ''}
								oninput={(e) => {
									const val = e.currentTarget.value;
									recipe.ingredients[idx].sectionName = val || undefined;
								}}
								name="ingredients[{idx}].sectionName"
								class="w-full border-b border-dashed border-ink/20 bg-transparent px-1 py-1 text-xs font-semibold tracking-wide text-ink-soft uppercase placeholder:font-normal placeholder:normal-case focus:border-blush-500/50 focus:outline-none"
							/>
						</div>
					{:else}
						<input
							type="hidden"
							name="ingredients[{idx}].sectionName"
							value={recipe.ingredients[idx].sectionName ?? ''}
						/>
					{/if}

					<div class="grid grid-cols-12 items-start gap-2">
						<label
							for="ingredient-name-{idx}"
							class="col-span-6 flex flex-col gap-1 text-xs font-medium text-ink-soft sm:col-span-7"
						>
							Ingredient
							<input
								name="ingredients[{idx}].name"
								id="ingredient-name-{idx}"
								type="text"
								bind:value={recipe.ingredients[idx].name}
								aria-invalid={Boolean(fieldError(`ingredients.${idx}.name`))}
								class="rounded-xl border bg-white px-3 py-2 text-sm text-ink focus:outline-none {fieldError(
									`ingredients.${idx}.name`
								)
									? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200'
									: 'border-ink/10 focus:border-blush-500/50'}"
							/>
							{#if fieldError(`ingredients.${idx}.name`)}
								<span class="text-xs font-medium text-red-600"
									>{fieldError(`ingredients.${idx}.name`)}</span
								>
							{/if}
						</label>

						<div class="col-span-3 flex min-w-0 flex-col gap-1 sm:col-span-2">
							<span class="text-xs font-medium text-ink-soft">Amount</span>
							<NumberStepper
								id="ingredient-amount-{idx}"
								name="ingredients[{idx}].amount"
								label="Amount"
								value={recipe.ingredients[idx].amount}
								min={0}
								max={100}
								step={0.25}
								fullWidth
								onchange={(v) => (recipe.ingredients[idx].amount = v)}
							/>
						</div>

						<label
							for="ingredient-unit-{idx}"
							class="col-span-2 flex flex-col gap-1 text-xs font-medium text-ink-soft"
						>
							Unit
							<input
								name="ingredients[{idx}].unit"
								id="ingredient-unit-{idx}"
								type="text"
								placeholder="cups"
								bind:value={recipe.ingredients[idx].unit}
								class="rounded-xl border border-ink/10 bg-white px-2 py-2 text-sm text-ink focus:border-blush-500/50 focus:outline-none"
							/>
						</label>

						<button
							type="button"
							aria-label={`Remove ingredient ${idx + 1}`}
							onclick={() => recipe.ingredients.splice(idx, 1)}
							class="col-span-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-blush-100 hover:text-blush-500"
						>
							✕
						</button>
					</div>
				{/each}
			</div>

			{#if fieldError('ingredients')}
				<p class="text-xs font-medium text-red-600">
					{fieldError('ingredients')}
				</p>
			{/if}

			<div class="flex gap-2">
				<button
					type="button"
					onclick={() =>
						recipe.ingredients.push({
							name: '',
							amount: 1,
							unit: '',
							sectionName: recipe.ingredients.at(-1)?.sectionName
						})}
					class="self-start rounded-full border border-dashed border-ink/20 px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-mint-200 hover:bg-mint-200/30 hover:text-ink"
				>
					+ Add ingredient
				</button>
				<button
					type="button"
					onclick={() =>
						recipe.ingredients.push({
							name: '',
							amount: 1,
							unit: '',
							sectionName: 'New section'
						})}
					class="self-start rounded-full border border-dashed border-ink/20 px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-mint-200 hover:bg-mint-200/30 hover:text-ink"
				>
					+ Add section
				</button>
			</div>
		</section>

		<!-- Steps -->
		<section
			class="flex flex-col gap-4 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-ink/5"
		>
			<h2 class="font-display text-lg font-semibold text-ink">Steps</h2>

			<div class="flex flex-col gap-3">
				{#each recipe.steps as _, idx (idx + '-stepIdx')}
					{@const showSectionHeader =
						idx === 0 ||
						recipe.steps[idx - 1].sectionName !== recipe.steps[idx].sectionName}
					{#if showSectionHeader}
						<div class="mt-3 flex items-center gap-2 first:mt-0">
							<input
								type="text"
								placeholder="Section name (e.g. Make the sauce)"
								value={recipe.steps[idx].sectionName ?? ''}
								oninput={(e) => {
									const val = e.currentTarget.value;
									recipe.steps[idx].sectionName = val || undefined;
								}}
								name="steps[{idx}].sectionName"
								class="w-full border-b border-dashed border-ink/20 bg-transparent px-1 py-1 text-xs font-semibold tracking-wide text-ink-soft uppercase placeholder:font-normal placeholder:normal-case focus:border-blush-500/50 focus:outline-none"
							/>
						</div>
					{:else}
						<input
							type="hidden"
							name="steps[{idx}].sectionName"
							value={recipe.steps[idx].sectionName ?? ''}
						/>
					{/if}

					<div class="flex flex-col gap-1">
						<div class="flex gap-3">
							<span
								class="mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-butter-300 font-display text-sm font-semibold text-ink"
							>
								{idx + 1}
							</span>
							<label for="step-{idx}" class="sr-only">Step {idx + 1}</label>
							<textarea
								name="steps[{idx}].description"
								id="step-{idx}"
								rows="2"
								bind:value={recipe.steps[idx].description}
								aria-invalid={Boolean(fieldError(`steps.${idx}.description`))}
								class="flex-1 rounded-xl border bg-white px-3 py-2 text-sm text-ink focus:outline-none {fieldError(
									`steps.${idx}.description`
								)
									? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200'
									: 'border-ink/10 focus:border-blush-500/50'}"
							></textarea>
							<button
								type="button"
								aria-label={`Remove step ${idx + 1}`}
								onclick={() => recipe.steps.splice(idx, 1)}
								class="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-blush-100 hover:text-blush-500"
							>
								✕
							</button>
						</div>
						{#if fieldError(`steps.${idx}.description`)}
							<span class="ml-10 text-xs font-medium text-red-600"
								>{fieldError(`steps.${idx}.description`)}</span
							>
						{/if}
					</div>
				{/each}
			</div>

			{#if fieldError('steps')}
				<p class="text-xs font-medium text-red-600">{fieldError('steps')}</p>
			{/if}

			<div class="flex gap-2">
				<button
					type="button"
					onclick={() =>
						recipe.steps.push({
							description: '',
							sectionName: recipe.steps.at(-1)?.sectionName
						})}
					class="self-start rounded-full border border-dashed border-ink/20 px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-mint-200 hover:bg-mint-200/30 hover:text-ink"
				>
					+ Add step
				</button>
				<button
					type="button"
					onclick={() =>
						recipe.steps.push({ description: '', sectionName: 'New section' })}
					class="self-start rounded-full border border-dashed border-ink/20 px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-mint-200 hover:bg-mint-200/30 hover:text-ink"
				>
					+ Add section
				</button>
			</div>
		</section>
		<section
			class="flex flex-col gap-4 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-ink/5"
		>
			<div>
				<h2 class="font-display text-lg font-semibold text-ink">Notes</h2>
				<p class="text-xs text-ink-soft">
					Optional — tips, substitutions, or things to remember next time.
				</p>
			</div>

			<label for="notes" class="sr-only">Notes</label>
			<textarea
				name="notes"
				id="notes"
				rows="3"
				bind:value={recipe.notes}
				placeholder="e.g. Swap chicken thighs for breasts if you prefer leaner meat."
				aria-invalid={Boolean(fieldError('notes'))}
				aria-describedby={fieldError('notes') ? 'notes-error' : undefined}
				class="rounded-xl border bg-white px-3 py-2 text-sm text-ink focus:outline-none {fieldError(
					'notes'
				)
					? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200'
					: 'border-ink/10 focus:border-blush-500/50 focus:ring-2 focus:ring-blush-300/50'}"
			></textarea>
			{#if fieldError('notes')}
				<span id="notes-error" class="text-xs font-medium text-red-600"
					>{fieldError('notes')}</span
				>
			{/if}
		</section>
		<!-- Actions -->
		<div
			class="fixed inset-x-0 bottom-0 z-20 flex justify-center border-t border-ink/10 bg-cream/90 px-4 py-4 backdrop-blur-md"
		>
			<div class="flex w-full max-w-3xl items-center justify-end gap-3">
				<a
					href={recipeToEdit ? `/recipe/${recipeToEdit.id}` : '/'}
					aria-disabled={submitting}
					class="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-blush-100 {submitting
						? 'pointer-events-none opacity-50'
						: ''}"
				>
					Cancel
				</a>
				<button
					type="submit"
					disabled={submitting}
					class="flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream shadow-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
				>
					{#if submitting}
						<svg
							class="h-4 w-4 animate-spin text-cream"
							viewBox="0 0 24 24"
							fill="none"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
							/>
						</svg>
						Saving…
					{:else}
						{recipeToEdit ? 'Save changes' : 'Add recipe'}
					{/if}
				</button>
			</div>
		</div>
	</form>
</div>

<style>
	.no-spinner::-webkit-inner-spin-button,
	.no-spinner::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	.no-spinner {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>
