import { UUIDTypes, v4 as uuidv4 } from "uuid";
import { CourseEnum } from "../enums/CourseEnum";
import { SeasonEnum } from "../enums/SeasonEnum";
import RecipeInterface from "../interfaces/recipes/RecipeInterface";
import { IngredientCategoryEnum } from "../enums/IngredientCategoryEnum";
import { UnitEnum } from "../enums/UnitEnum";
import BackendService from "./BackendService";

export default class RecipeService {

    static getEmptyRecipe() {
        return {
            uuid: uuidv4(),
            name: "Nouvelle recette",
            ingredients: [{ uuid: uuidv4(), name: "Ingrédient", category: IngredientCategoryEnum.CEREAL, season: [], quantity: { value: 0, unit: UnitEnum.CENTILITER } }],
            covers: 0,
            buyPrice: 0,
            sellPrice: 0,
            promotion: 0,
            course: CourseEnum.MAIN,
            steps: [{ key: 1, value: "Nouvelle étape" }],
            season: SeasonEnum.WINTER
        };
    }

    static fetchRecipesLocally(): RecipeInterface[] {
        const storedRecipes = localStorage.getItem('recipes');
        if (storedRecipes) {
            try {
                let recipes = JSON.parse(storedRecipes) as RecipeInterface[];
                recipes = recipes.map((recipe) => {
                    if (!recipe.uuid) {
                        recipe.uuid = uuidv4();
                    }
                    return recipe;
                });
                localStorage.setItem('recipes', JSON.stringify(recipes));
                return recipes;
            } catch {
                console.error('Invalid recipes in localStorage. Resetting to default.');
            }
        }
        const recipes = [RecipeService.getEmptyRecipe()];
        localStorage.setItem('recipes', JSON.stringify(recipes));
        return recipes;
    }

    static async fetchRecipesRemotly(): Promise<RecipeInterface[]> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;
        console.log(email + " et le token : " + token)
        const recipes: RecipeInterface[] = await BackendService.getPersonalRecipes(email, token);
        localStorage.setItem('recipes', JSON.stringify(recipes));
        return recipes;
    }

    static async addEmptyRecipe() {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;
        if (!email || !token) {
            throw new Error('User not logged in');
        }
        await BackendService.createNewEmptyRecipe(email, token);
    }

    static getRecipe(recipeUuid: UUIDTypes) {
        const recipes = RecipeService.fetchRecipesLocally();
        return recipes.find((recipe) => recipe.uuid === recipeUuid);
    }

    static async updateRecipe(recipe: RecipeInterface) {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;
        const updateRecipe = await BackendService.updateRecipe(email, token, recipe);
        return updateRecipe;
    }

    static async deleteRecipe(recipeUuid: UUIDTypes) {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;
        await BackendService.deleteRecipe(email, token, recipeUuid.toString());
        await RecipeService.fetchRecipesRemotly();
    }

    static async changeRecipeName(recipeUuid: UUIDTypes) {
        const recipe = this.getRecipe(recipeUuid);
        const newRecipeName = prompt("Nouveau nom de la recette", recipe?.name)?.slice(0, 70);
        const recipes = await RecipeService.fetchRecipesRemotly();
        const newRecipe = recipes.find((r) => r.uuid === recipeUuid);
        if (newRecipeName && newRecipe) {
            newRecipe.name = newRecipeName;
            await this.updateRecipe(newRecipe);
        }
        return newRecipe;
    }

    static importRecipe(data: File | JSON, setRecipes?: (recipes: RecipeInterface[]) => void): RecipeInterface[] {
        const reader = new FileReader();
        const recipes: RecipeInterface[] = RecipeService.fetchRecipesLocally() as RecipeInterface[];


        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        reader.onload = async (event) => {
            const fileText = event.target?.result as string;
            const jsonData = JSON.parse(fileText);

            const newRecipe = await BackendService.importRecipeFromLocalFile(jsonData, email, token);
            recipes.push(newRecipe);
            localStorage.setItem("recipes", JSON.stringify(recipes));

            alert(`Importation réussie !`);
            if (setRecipes) {
                setRecipes(recipes);
            }

            return recipes;
        };

        reader.onerror = (event) => {
            alert('Une erreur est survenue lors de la lecture du fichier.');
            console.error(event);
        };

        if (data instanceof File) {
            reader.readAsText(data);
        } else {
            const stringed = JSON.stringify(data)
            const parsed = JSON.parse(stringed);
            recipes.push(parsed);
            localStorage.setItem("recipes", JSON.stringify(recipes));
            alert(`Importation réussie ! Les données ont été enregistrées dans localStorage (clé 'recipes').`);
            if (setRecipes) {
                setRecipes(recipes);
            }
        }
        return recipes;
    }
}
