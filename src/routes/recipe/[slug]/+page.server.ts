import { getRecipe } from "$lib/components/recipes/recipeQueries";
import type { PageServerLoad } from "../$types";

export const load: PageServerLoad = async ({ params }) => {
  if(!params.slug) {
    throw new Error('No slug provided');
  }
  const recipe = await getRecipe(params.slug);
  console.log('recici', recipe);
  return { recipe };
};
