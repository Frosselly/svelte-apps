import Button from '$lib/components/button.svelte';
import { createRawSnippet } from 'svelte'; // svelte 5 snippets
import { describe, expect, it, vi } from 'vitest'; // test framework
import { render } from 'vitest-browser-svelte'; // svelte rendering
import { page } from 'vitest/browser'; // browser interactions

describe('MyButton', () => {
	it('should render with correct text', async () => {
		const children = createRawSnippet(() => ({
			render: () => `<span>Click me<span/>`
		}));
		await render(Button, { children });
		const button = page.getByRole('button', { name: 'Click me' });
		await expect.element(button).toBeInTheDocument();
	});
	it('should handle click events', async () => {
		const click_handler = vi.fn();
		const children = createRawSnippet(() => ({
			render: () => `<span>Click me</span>`
		}));
		await render(Button, { onclick: click_handler, children });
		const button = page.getByRole('button', { name: 'Click me' });
		await button.click();
		expect(click_handler).toHaveBeenCalled();
	});
	it('should apply correct variant class', async () => {
		const children = createRawSnippet(() => ({
			render: () => `<span>Secondary</span>`
		}));
		await render(Button, { variant: 'secondary', children });
		const button = page.getByTestId('my-button');
		await expect.element(button).toHaveClass('btn-secondary');
	});
});
