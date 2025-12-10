import { UUIDTypes } from "uuid";
import RecipeInterface from "../interfaces/recipes/RecipeInterface";
import BackendService from "./BackendService";

export default class RecipeService {

    static async fetchRecipeByUuid(uuid: string): Promise<RecipeInterface | null> {
        const email = localStorage.getItem('email');
        const token = localStorage.getItem('firebaseIdToken');

        return BackendService.getRecipeByUuid(uuid, email, token);
    }

    static async updateRecipe(recipe: RecipeInterface): Promise<RecipeInterface> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        return BackendService.updateRecipe(email, token, recipe);
    }

    static async deleteRecipe(recipeUuid: UUIDTypes): Promise<void> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        await BackendService.deleteRecipe(email, token, recipeUuid.toString());
    }

    static async changeRecipeName(recipeUuid: UUIDTypes, currentName: string): Promise<RecipeInterface | null> {
        const newRecipeName = prompt("Nouveau nom de la recette", currentName)?.slice(0, 70);

        if (!newRecipeName) {
            return null;
        }

        const recipe = await this.fetchRecipeByUuid(recipeUuid.toString());
        if (recipe) {
            recipe.name = newRecipeName;
            return this.updateRecipe(recipe);
        }
        return null;
    }
}
