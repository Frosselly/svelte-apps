<script lang="ts">
	import {
		categoryStyles,
		categoryLabel,
		formatMinutes,
		initials
	} from '$lib/components/recipes/utils/recipe-style';
	import type { Recipe } from '$lib/types';

	const { recipe }: { recipe: Recipe } = $props();

	const totalTime = $derived((recipe.prepTime ?? 0) + (recipe.cookTime ?? 0));
</script>

<a
	href={`/${recipe.id}`}
	class="group relative flex w-full flex-col overflow-hidden rounded-3xl bg-white/70 shadow-sm ring-1 ring-ink/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-blush-500/40"
>
	<div class="relative aspect-[4/3] w-full overflow-hidden bg-blush-100">
		{#if recipe.imageUrl}
			<img
				src={recipe.imageUrl}
				alt={recipe.title}
				class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
			/>
		{:else}
			<div
				class="flex h-full w-full items-center justify-center font-display text-4xl text-blush-500/60"
			>
				{recipe.title.charAt(0)}
			</div>
		{/if}

		{#if recipe.category}
			<span
				class={`absolute top-3 left-3 -rotate-2 rounded-full px-3 py-1 font-script text-base font-semibold shadow-sm ${categoryStyles[recipe.category]}`}
			>
				{categoryLabel[recipe.category]}
			</span>
		{/if}
	</div>

	<div class="flex flex-1 flex-col gap-2 p-5">
		<h3 class="font-display text-xl leading-snug font-semibold text-ink">
			{recipe.title}
		</h3>
		<p class="line-clamp-2 text-sm text-ink-soft">
			{recipe.description}
		</p>
	</div>

	<div
		class="flex items-center justify-between gap-3 border-t border-ink/5 px-5 py-4"
	>
		<div class="flex items-center gap-2">
			<span
				class="flex h-7 w-7 items-center justify-center rounded-full bg-mint-200 text-[11px] font-semibold text-ink"
			>
				{initials(recipe.authorName)}
			</span>
			<span class="text-xs text-ink-soft">{recipe.authorName ?? 'Unknown'}</span
			>
		</div>
		{#if formatMinutes(totalTime)}
			<span class="text-xs font-medium text-ink-soft"
				>{formatMinutes(totalTime)}</span
			>
		{/if}
	</div>
</a>
