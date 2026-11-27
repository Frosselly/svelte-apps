import type { StepInput } from '$lib/schemas/recipe';
import type { DbClient } from '$lib/server/db';
import { steps } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function findSteps(db: DbClient, recipeId: string) {
	return db
		.select({
			stepNr: steps.stepNr,
			description: steps.description
		})
		.from(steps)
		.where(eq(steps.recipeId, recipeId))
		.orderBy(steps.stepNr);
}

export function assignStepNumbers(steps: StepInput[]) {
	const counters = new Map<string | null, number>();
	return steps.map((s) => {
		const n = (counters.get(s.sectionName) ?? 0) + 1;
		counters.set(s.sectionName, n);
		return { ...s, stepNr: n };
	});
}
