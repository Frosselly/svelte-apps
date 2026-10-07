<script>
	let {
		id,
		name = id,
		label,
		value = 0,
		min = 0,
		max = 999,
		step = 1,
		suffix = '',
		width = 'w-11',
		fullWidth = false,
		variant = 'default', // 'default' | 'pill'
		size = 'md', // 'sm' | 'md'
		onchange = () => {
		}
	} = $props();

	function set(next) {
		const clamped = Math.min(max, Math.max(min, next));
		onchange(clamped);
	}

	function handleInput(e) {
		const raw = Number(e.currentTarget.value);
		set(Number.isFinite(raw) ? raw : min);
	}

	const containerStyles = {
		default:
			'rounded-xl border border-ink/10 bg-white focus-within:border-blush-500/50',
		pill: 'rounded-full bg-blush-100 focus-within:ring-2 focus-within:ring-blush-400/50'
	};

	const buttonStyles = {
		default:
			'text-ink-soft hover:bg-blush-50 hover:text-blush-600 active:bg-blush-100',
		pill: 'text-ink-soft hover:bg-blush-300 hover:text-blush-700 active:bg-blush-300'
	};

	const buttonSize = {
		sm: 'h-9 w-6',
		md: 'h-9 w-8'
	};

	const inputSize = {
		sm: 'text-xs',
		md: 'text-sm'
	};
</script>

<div
	class="{fullWidth
		? 'w-full'
		: 'w-fit'} flex min-w-0 items-center overflow-hidden {containerStyles[
		variant
	]}"
>
	<button
		type="button"
		aria-label={`Decrease ${label}`}
		onclick={() => set(value - step)}
		disabled={value <= min}
		class="flex {buttonSize[
			size
		]} shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent {buttonStyles[
			variant
		]}"
	>
		<svg width="9" height="2" viewBox="0 0 9 2" fill="none">
			<rect width="9" height="2" rx="1" fill="currentColor" />
		</svg>
	</button>

	<label for={id} class="sr-only">{label}</label>
	<input
		{id}
		{name}
		type="number"
		{min}
		{max}
		{step}
		{value}
		oninput={handleInput}
		class="no-spinner {fullWidth
			? 'min-w-0 flex-1'
			: width} border-0 bg-transparent px-0 text-center font-semibold text-ink focus:outline-none {inputSize[
			size
		]}"
	/>
	{#if suffix}
		<span class="w-6 shrink-0 pr-1 text-center text-xs text-ink-soft"
		>{suffix}</span
		>
	{/if}

	<button
		type="button"
		aria-label={`Increase ${label}`}
		onclick={() => set(value + step)}
		disabled={value >= max}
		class="flex {buttonSize[
			size
		]} shrink-0 items-center justify-center transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent {buttonStyles[
			variant
		]}"
	>
		<svg width="9" height="9" viewBox="0 0 9 9" fill="none">
			<rect y="3.5" width="9" height="2" rx="1" fill="currentColor" />
			<rect x="3.5" width="2" height="9" rx="1" fill="currentColor" />
		</svg>
	</button>
</div>

<style>
    .no-spinner::-webkit-inner-spin-button,
    .no-spinner::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .no-spinner {
        -moz-appearance: textfield;
        appearance: textfield;
    }
</style>
