import RecipeGenerationParametersInterface from "../interfaces/recipes/RecipeGenerationParametersInterface";
import BackendService from "../services/BackendService";
import RecipeInterface from "../interfaces/recipes/RecipeInterface";

export async function generateRecipe(
    generationInterface: RecipeGenerationParametersInterface,
    email: string,
    token: string
): Promise<RecipeInterface | null> {
    return BackendService.generateRecipeWithOpenAI(generationInterface, email, token);
}
