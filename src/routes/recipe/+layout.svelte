<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import MenuIcon from '$lib/assets/icons/MenuIcon.svelte';
	import AuthForm from '$lib/components/auth/AuthForm.svelte';
	import { fly } from 'svelte/transition';
	import { resolve } from '$app/paths';

	let { data, children } = $props();
	let showMenu = $state(false);

	const linksSidebar = {
		projects: [{ name: 'All recipes', href: resolve('/recipe') }]
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

{#snippet menuBtn()}
	<button
		class="menuBtn transition-color rounded-full p-2 duration-200 ease-in-out hover:bg-black/20"
		onclick={() => (showMenu = !showMenu)}><MenuIcon /></button
	>
{/snippet}

{#snippet newRecipeBtn()}
	{#if page.url.pathname.includes('recipe')}
		<a
			href={resolve('/recipe/manage')}
			class=" flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 font-sans text-sm font-semibold text-cream shadow-sm transition-transform hover:-translate-y-0.5"
		>
			<span class="text-nowrap">New recipe</span>
		</a>
	{/if}
{/snippet}

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<header
	class="sticky top-0 z-20 flex w-full items-center justify-between border-b border-ink/5 bg-cream/80 px-6 py-4 backdrop-blur-md"
>
	{@render menuBtn()}
	<div class="links">
		{@render links('row')}
	</div>
	{@render newRecipeBtn()}

	<div class="links">
		{#if data.username}
			User: {data.username}
		{:else if !showMenu}
			<div>
				<AuthForm />
			</div>
		{/if}
	</div>
</header>
{#if showMenu}
	<nav
		transition:fly={{ x: -200, duration: 300 }}
		class="fixed top-0 z-21 flex h-120 w-100 flex-col items-start justify-stretch gap-8 bg-cream px-6 py-5 pb-12 shadow-xl"
	>
		{@render menuBtn()}
		{@render links('col')}
		<div>
			{#if data.username}
				User: {data.username}
			{:else}
				<AuthForm />
			{/if}
		</div>
	</nav>
{/if}

{@render children()}

<style>
	.menuBtn {
		display: none;
	}
	@media (max-width: 785px) {
		.links {
			display: none;
		}
		.menuBtn {
			display: block;
		}
	}
</style>
