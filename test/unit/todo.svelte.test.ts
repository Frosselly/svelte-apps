import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import TodoForm from '$lib/components/todoForm.svelte';

describe('todo page UI', () => {
	it('should display an input with a label', async () => {
		await render(TodoForm);
		const input = page.getByLabelText('Your next task');
		await expect.element(input).toBeInTheDocument();
	});
	it('form should submit new task', async () => {
		const submit_handler = vi.fn();
		await render(TodoForm, { onsubmit: submit_handler });
		const input = page.getByLabelText('Your next task');
		await input.fill('Eat lunch');
		const submit_button = page.getByRole('button', { name: 'Add task' });
		await submit_button.click();
		expect(submit_handler).toHaveBeenCalledWith('Eat lunch');
		await expect
			.element(page.getByText('New task added successfully!'))
			.toBeInTheDocument();
	});
});
//mock all states and functions
// mock icons for lighter code
// make sure mocks are used instead of real data
// check if initial elements are rendered on the page
//  no crashes
//  default prop test
//  passing props test
// check form/interactable elements exist
//  group tests by interactable button context groups
// check major functionality testing
// check empty state
// check state with elements and their statuses
//*NOTE* you cant test functionality reliably
// check if button interactions don't throw errors
//
