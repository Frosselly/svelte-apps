<script lang="ts">
	import { deserialize } from '$app/forms';
	import type { ActionResult } from '@sveltejs/kit';
	import type { PageProps } from '../../../routes/recipe/$types';
	import type { CreateRecipeModel, Recipe } from './models';

	type PropsType = Partial<PageProps> & {
		recipeToEdit?: Recipe;
		docFile: File | undefined;
	};
	let { form, docFile = $bindable(), recipeToEdit }: PropsType = $props();

	const recipeDefault: Omit<CreateRecipeModel, 'userId'> = {
		title: '',
		description: '',
		category: 'dinner',
		ingredients: [{ name: '', amount: 1, unit: '' }],
		steps: [''],
		prepTime: 0,
		cookTime: 0,
		servings: 4
	};

	// `recipe` is the single source of truth for the whole form — title,
	// times, servings, ingredients and steps all live here. Editing
	// `recipe.ingredients[i]` / `recipe.steps[i]` directly (rather than
	// keeping separate arrays in sync) means an import or "fill sample
	// data" action that replaces `recipe` wholesale updates every field
	// in one go, including the repeatable rows.
	let recipe = $state(structuredClone(recipeToEdit ?? recipeDefault));

	// Only resets `recipe` in response to a *different* recipeToEdit being
	// passed in (e.g. navigating from ?editId=1 to ?editId=2). It never
	// reads `recipe` itself, so it can't re-trigger itself.
	$effect(() => {
		recipe = structuredClone(recipeToEdit ?? recipeDefault);
		newImagePreview = null;
	});

	let newImagePreview: string | null = $state(null);
	const imagePreview = $derived(
		newImagePreview ?? recipeToEdit?.imageUrl ?? null
	);

	function updateHours(field: 'prepTime' | 'cookTime', hours: number) {
		recipe[field] = hours * 60 + (recipe[field] % 60);
	}
	function updateMinutes(field: 'prepTime' | 'cookTime', minutes: number) {
		recipe[field] = Math.floor(recipe[field] / 60) * 60 + minutes;
	}

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
			category: 'dinner',
			ingredients: [
				{ name: 'boneless chicken thighs', amount: 4, unit: '' },
				{ name: 'garlic, minced', amount: 3, unit: 'cloves' },
				{ name: 'lemon, juiced', amount: 1, unit: '' },
				{ name: 'chicken stock', amount: 0.5, unit: 'cup' }
			],
			steps: [
				'Season the chicken thighs with salt and pepper on both sides.',
				'Sear in a hot skillet, 5 minutes per side, then set aside.',
				'Add garlic to the pan and cook until fragrant, about 30 seconds.',
				'Deglaze with lemon juice and stock, return chicken, and simmer 8 minutes.'
			],
			prepTime: 10,
			cookTime: 20,
			servings: 4
		} satisfies Omit<CreateRecipeModel, 'userId'>);
	}
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

	{#if form?.errors}
		<div
			class="rounded-2xl bg-blush-100 px-4 py-3 text-sm text-blush-500 ring-1 ring-blush-300"
		>
			Please check the highlighted fields and try again.
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

	<form method="POST" action="?/post" class="flex w-full flex-col gap-6">
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
					for="category"
					class="flex flex-col gap-1.5 text-sm font-medium text-ink"
				>
					Category
					<select
						name="category"
						id="category"
						required
						bind:value={recipe.category}
						class="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-blush-500/50 focus:ring-2 focus:ring-blush-300/50 focus:outline-none"
					>
						<option value="dinner">Dinner</option>
						<option value="dessert">Dessert</option>
					</select>
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

			<div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
				<fieldset class="flex flex-col gap-2">
					<legend class="mb-1 text-sm font-medium text-ink">Prep time</legend>
					<div class="flex items-center gap-3">
						<div class="flex items-center gap-1.5">
							<label for="prepTime-h" class="sr-only">Prep time, hours</label>
							<input
								id="prepTime-h"
								type="number"
								min="0"
								max="24"
								value={Math.floor(recipe.prepTime / 60)}
								oninput={(e) =>
									updateHours('prepTime', Number(e.currentTarget.value) || 0)}
								class="w-14 rounded-xl border border-ink/10 bg-white px-2 py-1.5 text-center text-sm text-ink focus:border-blush-500/50 focus:outline-none"
							/>
							<span class="text-xs text-ink-soft">h</span>
						</div>
						<div class="flex items-center gap-1.5">
							<label for="prepTime-m" class="sr-only">Prep time, minutes</label>
							<input
								id="prepTime-m"
								type="number"
								min="0"
								max="59"
								value={recipe.prepTime % 60}
								oninput={(e) =>
									updateMinutes('prepTime', Number(e.currentTarget.value) || 0)}
								class="w-14 rounded-xl border border-ink/10 bg-white px-2 py-1.5 text-center text-sm text-ink focus:border-blush-500/50 focus:outline-none"
							/>
							<span class="text-xs text-ink-soft">min</span>
						</div>
					</div>
					<input type="hidden" name="prepTime" value={recipe.prepTime} />
				</fieldset>

				<fieldset class="flex flex-col gap-2">
					<legend class="mb-1 text-sm font-medium text-ink">Cook time</legend>
					<div class="flex items-center gap-3">
						<div class="flex items-center gap-1.5">
							<label for="cookTime-h" class="sr-only">Cook time, hours</label>
							<input
								id="cookTime-h"
								type="number"
								min="0"
								max="24"
								value={Math.floor(recipe.cookTime / 60)}
								oninput={(e) =>
									updateHours('cookTime', Number(e.currentTarget.value) || 0)}
								class="w-14 rounded-xl border border-ink/10 bg-white px-2 py-1.5 text-center text-sm text-ink focus:border-blush-500/50 focus:outline-none"
							/>
							<span class="text-xs text-ink-soft">h</span>
						</div>
						<div class="flex items-center gap-1.5">
							<label for="cookTime-m" class="sr-only">Cook time, minutes</label>
							<input
								id="cookTime-m"
								type="number"
								min="0"
								max="59"
								value={recipe.cookTime % 60}
								oninput={(e) =>
									updateMinutes('cookTime', Number(e.currentTarget.value) || 0)}
								class="w-14 rounded-xl border border-ink/10 bg-white px-2 py-1.5 text-center text-sm text-ink focus:border-blush-500/50 focus:outline-none"
							/>
							<span class="text-xs text-ink-soft">min</span>
						</div>
					</div>
					<input type="hidden" name="cookTime" value={recipe.cookTime} />
				</fieldset>

				<label
					for="servings"
					class="flex flex-col gap-1.5 text-sm font-medium text-ink"
				>
					Servings
					<input
						name="servings"
						id="servings"
						type="number"
						min="1"
						required
						bind:value={recipe.servings}
						class="w-20 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-blush-500/50 focus:ring-2 focus:ring-blush-300/50 focus:outline-none"
					/>
				</label>
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
					<div class="grid grid-cols-12 items-end gap-2">
						<label
							for="ingredient-name-{idx}"
							class="col-span-6 flex flex-col gap-1 text-xs font-medium text-ink-soft sm:col-span-7"
						>
							Ingredient
							<input
								name="ingredients[{idx}].name"
								id="ingredient-name-{idx}"
								type="text"
								required
								bind:value={recipe.ingredients[idx].name}
								class="rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-blush-500/50 focus:outline-none"
							/>
						</label>
						<label
							for="ingredient-amount-{idx}"
							class="col-span-3 flex flex-col gap-1 text-xs font-medium text-ink-soft sm:col-span-2"
						>
							Amount
							<input
								name="ingredients[{idx}].amount"
								id="ingredient-amount-{idx}"
								type="number"
								min="0"
								step="0.25"
								required
								bind:value={recipe.ingredients[idx].amount}
								class="rounded-xl border border-ink/10 bg-white px-2 py-2 text-sm text-ink focus:border-blush-500/50 focus:outline-none"
							/>
						</label>
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
							class="col-span-1 flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-blush-100 hover:text-blush-500"
						>
							✕
						</button>
					</div>
				{/each}
			</div>

			<button
				type="button"
				onclick={() =>
					recipe.ingredients.push({ name: '', amount: 1, unit: '' })}
				class="self-start rounded-full border border-dashed border-ink/20 px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-mint-200 hover:bg-mint-200/30 hover:text-ink"
			>
				+ Add ingredient
			</button>
		</section>

		<!-- Steps -->
		<section
			class="flex flex-col gap-4 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-ink/5"
		>
			<h2 class="font-display text-lg font-semibold text-ink">Steps</h2>

			<div class="flex flex-col gap-3">
				{#each recipe.steps as _, idx (idx + '-stepIdx')}
					<div class="flex gap-3">
						<span
							class="mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-butter-300 font-display text-sm font-semibold text-ink"
						>
							{idx + 1}
						</span>
						<label for="step-{idx}" class="sr-only">Step {idx + 1}</label>
						<textarea
							name="steps[]"
							id="step-{idx}"
							rows="2"
							required
							bind:value={recipe.steps[idx]}
							class="flex-1 rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:border-blush-500/50 focus:outline-none"
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
				{/each}
			</div>

			<button
				type="button"
				onclick={() => recipe.steps.push('')}
				class="self-start rounded-full border border-dashed border-ink/20 px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:border-mint-200 hover:bg-mint-200/30 hover:text-ink"
			>
				+ Add step
			</button>
		</section>

		<!-- Actions -->
		<div
			class="fixed inset-x-0 bottom-0 z-20 flex justify-center border-t border-ink/10 bg-cream/90 px-4 py-4 backdrop-blur-md"
		>
			<div class="flex w-full max-w-3xl items-center justify-end gap-3">
				<a
					href={recipeToEdit ? `/recipe/${recipeToEdit.id}` : '/'}
					class="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-blush-100"
				>
					Cancel
				</a>
				<button
					type="submit"
					class="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-cream shadow-sm transition-transform hover:-translate-y-0.5"
				>
					{recipeToEdit ? 'Save changes' : 'Add recipe'}
				</button>
			</div>
		</div>
	</form>
</div>
