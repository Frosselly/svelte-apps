<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import AuthForm from '$lib/components/auth/AuthForm.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let { data, children } = $props();

	const linksSidebar = {
		projects: [
			{ name: 'Home', href: '/' },
			{ name: 'Todo', href: '/todo' },
			{ name: 'Recipes saver', href: '/recipe' }
		]
	};

	onMount(() => {
		console.log();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<header
	class="sticky top-0 z-20 flex w-full items-center justify-between border-b border-ink/5 bg-cream/80 px-6 py-4 backdrop-blur-md"
>
	<div class="flex gap-6">
		{#each linksSidebar.projects as link, i (i)}
			<a class="font-display text-xl font-semibold text-ink" href={link.href}
			>{link.name}</a
			>
		{/each}
	</div>
	{#if page.url.pathname.includes('recipe')}
		<a href="/recipe/manage"
			 class="flex justify-center items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-sans text-sm font-semibold text-cream shadow-sm transition-transform hover:-translate-y-0.5">

			<span>New recipe</span>
		</a>
	{/if}
	<div>
		{#if data.username}
			User: {data.username}
		{:else}
			<AuthForm />
		{/if}
	</div>
</header>
{@render children()}
