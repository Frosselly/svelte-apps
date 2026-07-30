<script>
	import { greet } from './greet';

	function generateLuckyNumber() {
		const time = Date.now();
		return time;
	}
	let { host = 'SvelteKit', guest = 'Vitest' } = $props();
</script>

<h1>{greet(host)}</h1>
<p>{greet(guest)}</p>
<p>A loveley day today yes?</p>

<h2>Your today lucky number is: <span>{generateLuckyNumber()}</span></h2>
