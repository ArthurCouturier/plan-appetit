import { useState } from "react";
import { HomeButton } from "../components/buttons/BackAndHomeButton";
import RecipeInterface from "../api/interfaces/recipes/RecipeInterface";
import RecipeManager from "../api/recipes/RecipeManager";
import RecipeCard from "../components/cards/RecipeCard";
import { ImportRecipeButton } from "../components/buttons/DataImportButtons";
import { AddRecipeButton, GenerateAIRecipeButton } from "../components/buttons/NewRecipeButton";

export default function Recipes() {
    const [recipes, setRecipes] = useState<RecipeInterface[]>(RecipeManager.fetchRecipes());

    return (
        <div className="w-full bg-bg-color p-6 relative">

            <div className="relative flex items-center w-full p-2">
                <div className="flex items-center">
                    <HomeButton />
                    <h1 className="text-lg lg:text-2xl xl:text-3xl font-bold text-text-primary ml-2">
                        Plan'Appétit
                    </h1>
                </div>

                <h2 className="text-lg lg:text-2xl xl:text-3xl font-bold text-text-primary absolute left-1/2 -translate-x-1/2">
                    Livre des recettes
                </h2>
            </div>

            <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 bg-primary p-4 rounded-lg">
                <AddRecipeButton setRecipes={setRecipes} disabled={false} />
                <ImportRecipeButton setRecipes={setRecipes} disabled={false} />
                <GenerateAIRecipeButton disabled={false} />
                {recipes.map((recipe: RecipeInterface, index: number) => (
                    <RecipeCard key={index} recipe={recipe} />
                ))}
            </div>
        </div>
    );
}
