import * as v from 'valibot';

const ImageFile = v.pipe(
	v.instance(File),
	v.mimeType(['image/jpeg', 'image/png']),
	v.maxSize(1024 * 1024 * 10, 'Image must be less than 10MB')
);

export const IngredientSchema = v.object({
	sectionName: v.optional(
		v.pipe(v.string(), v.minLength(1, 'Name is required'))
	),
	name: v.pipe(v.string(), v.trim(), v.nonEmpty()),
	amount: v.pipe(v.number(), v.minValue(0)),
	unit: v.optional(v.string())
});
export const StepSchema = v.object({
	sectionName: v.optional(
		v.pipe(v.string(), v.minLength(1, 'Name is required'))
	),
	description: v.pipe(v.string(), v.nonEmpty()),
	stepImages: v.optional(v.pipe(v.array(ImageFile)))
});

export const CreateRecipeSchema = v.object({
	title: v.pipe(
		v.string(),
		v.trim(),
		v.minLength(1, 'Title is required'),
		v.maxLength(255, 'Title must be 255 characters or less')
	),
	description: v.optional(
		v.pipe(
			v.string(),
			v.trim(),
			v.maxLength(2000, 'Description must be 2000 characters or less')
		)
	),
	categories: v.optional(
		v.array(
			v.pipe(
				v.string(),
				v.nonEmpty(),
				v.maxLength(50, 'Max category length 50')
			)
		)
	),
	cookTime: v.pipe(
		v.number(),
		v.minValue(0, 'Cook time is required'),
		v.maxValue(10080, 'Cook time must be 10080 (1 week) or less')
	),
	prepTime: v.pipe(
		v.number(),
		v.minValue(0, 'Prep time is required'),
		v.maxValue(10080, 'Cook time must be 10080 (1 week) or less')
	),
	ingredients: v.pipe(
		v.array(IngredientSchema),
		v.minLength(1, 'At least one ingredient is required')
	),
	servings: v.pipe(v.number(), v.minValue(1, 'Servings is required')),
	notes: v.optional(v.pipe(v.string(), v.trim())),
	steps: v.pipe(
		v.array(StepSchema),
		v.minLength(1, 'At least one step is required')
	),
	userId: v.pipe(v.string(), v.trim(), v.minLength(1, 'User ID is required')),
	image: v.optional(ImageFile)
});

type CreateRecipe = v.InferOutput<typeof CreateRecipeSchema>;

export const UpdateRecipeSchema = v.partial(CreateRecipeSchema);

export type StepInput = v.InferOutput<typeof StepSchema>;

const recipeSortingKeys = [
	'title',
	'description',
	'cookTime',
	'prepTime'
] as const satisfies readonly (keyof CreateRecipe)[];

export type RecipeSortingKey = (typeof recipeSortingKeys)[number];

export const RecipePagingSchema = v.object({
	q: v.optional(v.pipe(v.string(), v.trim())),
	offset: v.optional(v.pipe(v.number(), v.minValue(0))),
	pageSize: v.optional(v.pipe(v.number(), v.minValue(1))),
	sort: v.optional(
		v.pipe(
			v.array(
				v.pipe(
					v.string(),
					v.nonEmpty(),
					v.check((val) => {
						const matchSign = val.match(/^[+-]/);
						const matchKey = recipeSortingKeys.includes(
							val.slice(1) as (typeof recipeSortingKeys)[number]
						);
						return !!matchSign && matchKey;
					})
				)
			),
			v.minLength(1, 'At least one sort key is required')
		)
	),
	categories: v.optional(
		v.pipe(v.array(v.pipe(v.string(), v.nonEmpty())), v.minLength(1))
	)
});
