import { UUIDTypes, v4 as uuidv4 } from "uuid";
import { CourseEnum } from "../enums/CourseEnum";
import { SeasonEnum } from "../enums/SeasonEnum";
import RecipeInterface from "../interfaces/recipes/RecipeInterface";
import { IngredientCategoryEnum } from "../enums/IngredientCategoryEnum";
import { UnitEnum } from "../enums/UnitEnum";

export default class RecipeManager {
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

    static fetchRecipes(): RecipeInterface[] {
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
        const recipes = [RecipeManager.getEmptyRecipe()];
        localStorage.setItem('recipes', JSON.stringify(recipes));
        return recipes;
    }

    static addEmptyRecipe() {
        const recipes = RecipeManager.fetchRecipes();
        recipes.push(RecipeManager.getEmptyRecipe());
        localStorage.setItem('recipes', JSON.stringify(recipes));
    }

    static getRecipe(recipeUuid: UUIDTypes) {
        const recipes = RecipeManager.fetchRecipes();
        return recipes.find((recipe) => recipe.uuid === recipeUuid);
    }

    static updateRecipe(recipe: RecipeInterface) {
        const recipes = RecipeManager.fetchRecipes();
        const index = recipes.findIndex((r) => r.uuid === recipe.uuid);
        recipes[index] = recipe;
        localStorage.setItem('recipes', JSON.stringify(recipes));
    }

    static deleteRecipe(recipeUuid: UUIDTypes) {
        let recipes = RecipeManager.fetchRecipes();
        recipes = recipes.filter((recipe) => recipe.uuid !== recipeUuid);
        localStorage.setItem('recipes', JSON.stringify(recipes));
    }

    static changeRecipeName(recipeUuid: UUIDTypes) {
        const recipe = this.getRecipe(recipeUuid);
        const newRecipeName = prompt("Nouveau nom de la recette", recipe?.name);
        const recipes = RecipeManager.fetchRecipes();
        const newRecipe = recipes.find((r) => r.uuid === recipeUuid);
        if (newRecipeName && newRecipe) {
            newRecipe.name = newRecipeName;
            RecipeManager.updateRecipe(newRecipe);
        }
        return newRecipe;
    }

    static importRecipe(data: File | JSON, setRecipes?: (recipes: RecipeInterface[]) => void): RecipeInterface[] {
        const reader = new FileReader();
        const recipes: RecipeInterface[] = RecipeManager.fetchRecipes() as RecipeInterface[];

        reader.onload = (event) => {
            const fileText = event.target?.result as string;
            const jsonData = JSON.parse(fileText);

            recipes.push(jsonData);
            localStorage.setItem("recipes", JSON.stringify(recipes));

            alert(`Importation réussie ! Les données ont été enregistrées dans localStorage (clé 'recipes').`);
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
