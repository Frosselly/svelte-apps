<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary';
		disabled?: boolean;
		onclick?: () => void;
		children: any;
	}
	let {
		variant = 'primary',
		disabled = false,
		onclick,
		children
	}: Props = $props();
</script>

<button class="btn btn-{variant}" {disabled} {onclick} data-testid="my-button">
	{@render children()}
</button>
