<script lang="ts">
	import RecipeCard from '$lib/components/recipes/RecipeCard.svelte';

	import RecentlyViewed from '$lib/components/recipes/RecentlyViewed.svelte';
	import RecipeSearch from '$lib/components/recipes/RecipeSearch.svelte';
	import type { SortOption } from '$lib/types.js';
	import type { Recipe } from '$lib/components/recipes/models.js';

	const { data } = $props();

	const recipes: Recipe[] = $derived(data.recipes ?? []);
	const categories = $derived(data.categories);

	let query = $state('');
	let selectedCategories: string[] = $state([]);
	let sort = $state<SortOption>('newest');

	const filteredRecipes = $derived.by(() => {
		const q = query.trim().toLowerCase();

		const list = recipes.filter((r) => {
			const matchesQuery =
				q.length === 0 ||
				r.title.toLowerCase().includes(q) ||
				r.description?.toLowerCase().includes(q);
			const matchesCategory =
				selectedCategories.length <= 0
					? true
					: r.categories.some((c) => selectedCategories.includes(c));
			return matchesQuery && matchesCategory;
		});

		return [...list].sort((a, b) => {
			if (sort === 'quickest') {
				return a.prepTime + a.cookTime - (b.prepTime + b.cookTime);
			}
			const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
			const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
			return sort === 'newest' ? bTime - aTime : aTime - bTime;
		});
	});
</script>

<main class="flex w-full flex-col items-center gap-16 bg-cream pb-24">
	<section class="relative flex w-full flex-col items-center">
		<div
			class="hero-gradient relative flex h-[26rem] w-full flex-col items-center justify-center gap-4 px-4 text-center"
		>
			<h1
				class="relative font-display text-5xl font-semibold text-ink sm:text-6xl"
			>
				Your recipe vault
			</h1>
			<p class="relative font-script text-2xl text-ink/80 sm:text-3xl">
				every dish worth remembering, kept in one place
			</p>
		</div>

		<div class="relative z-10 -mt-8 w-full px-4">
			<RecipeSearch bind:query bind:selectedCategories bind:sort {categories} />
		</div>
	</section>

	<div class="flex w-full max-w-6xl flex-col gap-16 px-4">
		<RecentlyViewed {recipes} />

		<section class="flex flex-col gap-6">
			<div class="flex items-baseline justify-between">
				<h2 class="font-display text-2xl font-semibold text-ink">
					All recipes
				</h2>
				<span class="text-sm text-ink-soft">{filteredRecipes.length} saved</span
				>
			</div>

			{#if filteredRecipes.length > 0}
				<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredRecipes as recipe (recipe.id)}
						<RecipeCard {recipe} />
					{/each}
				</div>
			{:else}
				<div
					class="flex flex-col items-center gap-2 rounded-3xl bg-white/60 py-16 text-center"
				>
					<p class="font-display text-xl text-ink">No recipes match yet</p>
					<p class="text-sm text-ink-soft">
						Try a different search or selectedCategory.
					</p>
				</div>
			{/if}
		</section>
	</div>
</main>

<style>
	.hero-gradient {
		background: radial-gradient(
			81.84% 81.84% at 18.16% 22.32%,
			#eca9d3 0%,
			#f2c3d4 51.92%,
			#fbeded 100%
		);
	}
	.blob {
		position: absolute;
		border-radius: 9999px;
		filter: blur(60px);
		opacity: 0.5;
		pointer-events: none;
	}
	.blob-a {
		top: -4rem;
		right: -4rem;
		height: 16rem;
		width: 16rem;
		background: #c9baef;
	}
	.blob-b {
		bottom: -3rem;
		left: -2rem;
		height: 14rem;
		width: 14rem;
		background: #dcf3e6;
	}
</style>
