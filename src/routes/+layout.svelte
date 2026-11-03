<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';

	let { children } = $props();

	const linksSidebar = {
		projects: [
			{ name: 'Home', href: resolve('/') },
			{ name: 'Todo', href: resolve('/todo') },
			{ name: 'Recipes saver', href: resolve('/recipe') }
		]
	};
</script>

{#snippet links(alignment: 'col' | 'row')}
	<div class={[' flex w-full', alignment == 'col' && 'flex-col']}>
		{#each linksSidebar.projects as link, i (i)}
			<a
				class={[
					alignment == 'col' && 'hover:bg-blush-500/10',
					'px-2 py-4 font-display text-xl font-semibold text-ink transition-all duration-200 ease-in-out  hover:underline'
				]}
				href={link.href}>{link.name}</a
			>
		{/each}
	</div>
{/snippet}

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<header
	class="sticky top-0 z-20 flex w-full items-center justify-between border-b border-ink/5 bg-white px-6 py-4 backdrop-blur-md"
>
	<div class="links">
		{@render links('row')}
	</div>
</header>
{@render children()}

<style>
	@media (max-width: 785px) {
		.links {
			display: none;
		}
	}
</style>
