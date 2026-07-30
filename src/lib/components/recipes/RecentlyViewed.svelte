<script lang="ts">
	import { onMount } from 'svelte';
	import RecipeCard from './RecipeCard.svelte';
	import type { Recipe } from '$lib/types';

	const { recipes }: { recipes: Recipe[] } = $props();

	let recentRecipes: Recipe[] = $state([]);

	onMount(() => {
		try {
			const stored = JSON.parse(
				localStorage.getItem('recentlyViewedRecipeIds') ?? '[]'
			) as string[];
			recentRecipes = stored
				.map((id) => recipes.find((r) => r.id === id))
				.filter((r): r is Recipe => Boolean(r))
				.slice(0, 8);
		} catch {
			recentRecipes = [];
		}
	});
</script>

{#if recentRecipes.length > 0}
	<section class="flex w-full flex-col gap-4">
		<div class="flex items-baseline gap-3">
			<h2 class="font-display text-2xl font-semibold text-ink">
				Recently viewed
			</h2>
			<span class="font-script text-lg text-blush-500"
				>pick up where you left off</span
			>
		</div>
		<div class="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
			{#each recentRecipes as recipe (recipe.id)}
				<div class="w-64 shrink-0">
					<RecipeCard {recipe} />
				</div>
			{/each}
		</div>
	</section>
{/if}

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
</style>
