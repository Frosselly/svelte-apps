<script lang="ts">
	import type { SortOption } from '$lib/types';

	let {
		query = $bindable(''),
		selectedCategory = $bindable('all'),
		categories,
		sort = $bindable('newest')
	}: {
		query?: string;
		selectedCategory?: string;
		categories: {
			id?: string;
			createdAt?: Date | null;
			name: string;
		}[];
		sort?: SortOption;
	} = $props();

	let filtersOpen = $state(false);

	const sorts: { value: SortOption; label: string }[] = [
		{ value: 'newest', label: 'Newest first' },
		{ value: 'oldest', label: 'Oldest first' },
		{ value: 'quickest', label: 'Quickest to make' }
	];
</script>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-3">
	<div
		class="flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-lg ring-1 ring-ink/5"
	>
		<svg
			class="h-5 w-5 shrink-0 text-ink-soft"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="m21 21-4.34-4.34M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
			/>
		</svg>
		<input
			type="text"
			bind:value={query}
			placeholder="Search your recipes..."
			class="w-full bg-transparent font-sans text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none"
		/>
		<button
			type="button"
			onclick={() => (filtersOpen = !filtersOpen)}
			class="flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-blush-100"
			aria-expanded={filtersOpen}
		>
			Filters
			<svg
				class={`h-3.5 w-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="m19 9-7 7-7-7"
				/>
			</svg>
		</button>
	</div>

	{#if filtersOpen}
		<div
			class="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-ink/5"
		>
			<span class="mr-1 text-xs font-medium text-ink-soft"
				>selectedCategory</span
			>
			{#each categories as c (c.name)}
				<button
					type="button"
					onclick={() => (selectedCategory = c.name)}
					class={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
						selectedCategory === c.name
							? 'bg-ink text-cream'
							: 'bg-blush-100 text-ink-soft hover:bg-blush-300'
					}`}
				>
					{c.name}
				</button>
			{/each}

			<span class="mr-1 ml-3 text-xs font-medium text-ink-soft">Sort</span>
			<select
				bind:value={sort}
				class="rounded-full bg-blush-100 px-3 py-1 text-xs font-medium text-ink-soft focus:outline-none"
			>
				{#each sorts as s (s.value)}
					<option value={s.value}>{s.label}</option>
				{/each}
			</select>
		</div>
	{/if}
</div>
