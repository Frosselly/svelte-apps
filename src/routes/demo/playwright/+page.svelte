<script lang="ts">
	let num = $state(0);
</script>

<h1 class="h1">Playwright e2e test demo</h1>
<button onclick={() => (num = Date.now())}>Generate</button>
{#if num}
	<h2>Your lucky number: <span>num</span></h2>
{/if}
