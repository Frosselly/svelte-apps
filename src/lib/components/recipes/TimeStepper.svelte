<script>
	import NumberStepper from './NumberStepper.svelte';

	let { legend, name, value = 0, onchange = () => {} } = $props();

	let hours = $derived(Math.floor(value / 60));
	let minutes = $derived(value % 60);

	function updateHours(h) {
		onchange(h * 60 + minutes);
	}

	function updateMinutes(m) {
		onchange(hours * 60 + m);
	}
</script>

<fieldset class="flex min-w-0 flex-col gap-2">
	<legend class="mb-1 text-sm font-medium text-ink">{legend}</legend>
	<div class="flex flex-wrap items-center gap-2">
		<NumberStepper
			id={`${name}-H`}
			label={`${legend}, hours`}
			value={hours}
			min={0}
			max={24}
			suffix="h"
			onchange={updateHours}
		/>
		<NumberStepper
			id={`${name}-M`}
			label={`${legend}, minutes`}
			value={minutes}
			min={0}
			max={59}
			suffix="min"
			onchange={updateMinutes}
		/>
	</div>
	<input type="hidden" {name} {value} />
</fieldset>
