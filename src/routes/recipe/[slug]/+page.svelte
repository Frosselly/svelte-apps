<script lang="ts">
	import type { Recipe } from '$lib/components/recipes/models';
	import type { PageProps } from '../$types';
	import {
		categoryStyles,
		formatMinutes
	} from '$lib/components/recipes/utils/recipe-style';
	import NumberStepper from '$lib/components/recipes/NumberStepper.svelte';
	import { enhance } from '$app/forms';

	let { data }: PageProps = $props();
	let recipe: Recipe = $derived(data.recipe);

	// Local, editable serving count used to scale ingredient amounts.
	// Resets whenever a different recipe is loaded.
	let servings = $state(recipe.servings);
	$effect(() => {
		servings = recipe.servings;
	});

	const scale = $derived(recipe.servings > 0 ? servings / recipe.servings : 1);

	function scaledAmount(amount: number) {
		return Number((amount * scale).toFixed(2)).toString();
	}
</script>

<main class="mx-auto flex w-full max-w-5xl flex-col gap-10 bg-cream px-4 py-10">
	<div class="flex items-center justify-between">
		<a
			href="/recipe"
			class="flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
		>
			<svg
				class="h-4 w-4"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M15 19l-7-7 7-7"
				/>
			</svg>
			Back to recipes
		</a>
		<div class="flex items-center gap-2">
			<a
				href={`/recipe/manage?editId=${recipe.id}`}
				class="rounded-full border border-mint-200 bg-mint-200/40 px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-mint-200"
			>
				Edit
			</a>
			<form method="POST" action="?/delete" use:enhance>
				<button
					type="submit"
					class="rounded-full border border-blush-500/50 bg-blush-100 px-4 py-1.5 text-xs font-semibold text-blush-500 transition-colors hover:bg-blush-300 hover:text-ink"
					>Delete recipe</button
				>
			</form>
		</div>
	</div>

	<div class="flex flex-col gap-8 md:flex-row">
		<!-- Image + notes -->
		<div class="flex w-full flex-col gap-4 md:w-72 md:shrink-0">
			<div
				class="aspect-square w-full overflow-hidden rounded-3xl bg-blush-100 shadow-sm"
			>
				{#if recipe.imageUrl}
					<img
						src={recipe.imageUrl}
						alt={recipe.title}
						class="h-full w-full object-cover"
					/>
				{:else}
					<div
						class="flex h-full w-full items-center justify-center font-display text-5xl text-blush-500/60"
					>
						{recipe.title.charAt(0)}
					</div>
				{/if}
			</div>

			<div class="rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-ink/5">
				<h2 class="mb-2 font-display text-lg font-semibold text-ink">Notes</h2>
				{#if recipe.notes}
					<p class="text-sm whitespace-pre-line text-ink-soft">
						{recipe.notes}
					</p>
				{:else}
					<p class="text-sm text-ink-soft/70 italic">No notes yet.</p>
				{/if}
			</div>
		</div>

		<!-- Title, meta, description -->
		<div class="flex flex-1 flex-col gap-4">
			<div class="flex flex-wrap items-start justify-between gap-3">
				<h1 class="font-display text-3xl font-semibold text-ink sm:text-4xl">
					{recipe.title}
				</h1>
				{#if recipe.categories}
					<div class="flex flex-wrap gap-2">
						{#each recipe.categories as category (category)}
							<span
								class={`shrink-0 -rotate-2 rounded-full px-3 py-1 font-script text-base font-semibold shadow-sm ` +
									categoryStyles[category]}
							>
								{String(category).replace(/^\w/, (c) => c.toUpperCase())}
							</span>
						{/each}
					</div>
				{/if}
			</div>

			<div class="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
				<span>By {recipe.author.username ?? 'Unknown'}</span>
				<span class="opacity-40">·</span>
				<span>{recipe.createdAt?.toLocaleDateString() ?? 'Undated'}</span>
			</div>

			<p class="text-sm leading-relaxed text-ink-soft">{recipe.description}</p>

			<div class="flex flex-wrap gap-3 pt-1">
				{#if formatMinutes(recipe.prepTime)}
					<span
						class="flex items-center gap-1.5 rounded-full bg-lavender-200 px-3 py-1.5 text-xs font-medium text-ink"
					>
						<svg
							class="h-3.5 w-3.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="12" cy="12" r="9" />
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 7v5l3 3"
							/>
						</svg>
						Prep {formatMinutes(recipe.prepTime)}
					</span>
				{/if}
				{#if formatMinutes(recipe.cookTime)}
					<span
						class="flex items-center gap-1.5 rounded-full bg-butter-300/70 px-3 py-1.5 text-xs font-medium text-ink"
					>
						<svg
							class="h-3.5 w-3.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 2c-1 3-4 4-4 8a4 4 0 0 0 8 0c0-1.5-1-2-1-3 1 0 2 1 2 3a5 5 0 0 1-10 0c0-4 3-5 4-9 0 0 1 1 1 1Z"
							/>
						</svg>
						Cook {formatMinutes(recipe.cookTime)}
					</span>
				{/if}
				<span
					class="flex items-center gap-1.5 rounded-full bg-mint-200 px-3 py-1.5 text-xs font-medium text-ink"
				>
					<svg
						class="h-3.5 w-3.5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM23 20v-1a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
						/>
					</svg>
					{recipe.servings} servings
				</span>
			</div>
		</div>
	</div>

	<div class="border-t border-ink/10"></div>

	<!-- Ingredients -->
	<section
		class="flex flex-col gap-4 rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-ink/5"
	>
		<div class="flex flex-wrap items-center justify-between gap-3">
			<h2 class="font-display text-2xl font-semibold text-ink">Ingredients</h2>
			<div class="flex items-center gap-2 text-xs font-medium text-ink-soft">
				Servings
				<NumberStepper
					id="servings-compact"
					name="servings"
					label="Servings"
					value={servings}
					min={1}
					max={50}
					variant="pill"
					size="sm"
					onchange={(v) => (servings = v)}
				/>
			</div>
		</div>
		<ul class="flex flex-col divide-y divide-ink/5">
			{#each recipe.ingredients as ing, idx (idx + '-ing')}
				<li class="flex items-center gap-3 py-2.5 text-sm text-ink">
					<span class="w-24 shrink-0 font-semibold text-ink-soft">
						{scaledAmount(ing.amount)}{ing.unit ? ` ${ing.unit}` : ''}
					</span>
					<span>{ing.name}</span>
				</li>
			{/each}
		</ul>
	</section>

	<!-- Instructions -->
	<section class="flex flex-col gap-4">
		<h2 class="font-display text-2xl font-semibold text-ink">Instructions</h2>
		<ol class="flex flex-col gap-3">
			{#each recipe.steps as step, idx (idx + '-step')}
				<li
					class="flex gap-4 rounded-2xl bg-white/70 p-4 shadow-sm ring-1 ring-ink/5"
				>
					<span
						class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-butter-300 font-display text-sm font-semibold text-ink"
					>
						{idx + 1}
					</span>
					<p class="text-sm leading-relaxed text-ink-soft">{step}</p>
				</li>
			{/each}
		</ol>
	</section>
</main>
