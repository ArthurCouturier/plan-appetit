import RecipeGenerationParametersInterface from "../interfaces/recipes/RecipeGenerationParametersInterface";
import BackendService from "../services/BackendService";
import RecipeInterface from "../interfaces/recipes/RecipeInterface";

const backendService: BackendService = new BackendService();

export async function generateRecipe(
    generationInterface: RecipeGenerationParametersInterface,
    email: string,
    token: string
): Promise<RecipeInterface | null> {
    return backendService.generateRepiceWithOpenAI(generationInterface, email, token);
}
