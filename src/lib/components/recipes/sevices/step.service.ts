import type { DbClient } from '$lib/server/db';
import { stepImages, steps } from '$lib/server/db/schema';
import type { StepModel } from '../models';
import { assignStepNumbers } from '../repositories/steps.repository';
import { saveImage } from './image.service';

type stepRow = {
	id: `${string}-${string}-${string}-${string}-${string}`;
	recipeId: string;
	sectionName: string | undefined;
	stepNr: number;
	description: string;
	stepImages: File[] | undefined;
};

async function insertSteps(
	db: DbClient,
	stepsToInsert: StepModel[],
	recipeId: string
) {
	const stepRows = assignStepNumbers(stepsToInsert).map((s) => ({
		id: crypto.randomUUID(),
		recipeId,
		sectionName: s.sectionName,
		stepNr: s.stepNr,
		description: s.description,
		stepImages: s.stepImages
	}));

	await saveStepImages(db, stepRows);

	await db.insert(steps).values(stepRows);
}

async function saveStepImages(db: DbClient, stepRows: stepRow[]) {
	const stepImagePromises = stepRows.flatMap((s) => {
		if (!s.stepImages) return [];

		return s.stepImages?.map(async (img) => {
			const stepImageUrl = await saveImage(img, s.recipeId);
			return {
				stepId: s.id,
				imageUrl: stepImageUrl
			};
		});
	});
	const stepImageRows = await Promise.all(stepImagePromises);
	await db.insert(stepImages).values(stepImageRows);
}

async function updateStepImages(db: DbClient, stepsToUpdate) {
	// find all current recipe steps images
	db.select(stepImages).where(eq());
	// compare with new steps
	// delete missing by imageUrl
	// save new images
	// insert new images in the db
}

async function deleteSteps(stepId: string) {}
