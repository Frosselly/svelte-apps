<script lang="ts">
	import type {
		HTMLInputAttributes,
		HTMLInputTypeAttribute
	} from 'svelte/elements';

	interface PropsType {
		name: string;
		required?: boolean;
		type: HTMLInputTypeAttribute;
		extraInputStyle?: string;
		extraLabelStyle?: string;
		value?: string;
	}
	const {
		name,
		required,
		type,
		extraInputStyle,
		extraLabelStyle,
		children,
		value = $bindable(),
		...rest
	}: PropsType & Partial<HTMLInputAttributes> = $props();
</script>

<label for={rest.id ?? name}>
	<span class={'label-text' + (extraLabelStyle ?? '')}
		>{@render children?.()}</span
	>
	<input
		{type}
		class={'input' + (extraInputStyle ?? '')}
		id={rest.id ?? name}
		{name}
		{required}
		{value}
		{...rest}
	/>
</label>
