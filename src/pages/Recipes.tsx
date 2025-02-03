import { useState } from "react";
import { HomeButton } from "../components/buttons/BackAndHomeButton";
import RecipeInterface from "../api/interfaces/recipes/RecipeInterface";
import RecipeManager from "../api/recipes/RecipeManager";
import RecipeCard from "../components/cards/RecipeCard";
import { ImportRecipeButton } from "../components/buttons/DataImportButtons";
import { AddRecipeButton, GenerateAIRecipeButton } from "../components/buttons/NewRecipeButton";
import { generateRecipe } from "../api/recipes/OpenAIRecipeGenerator";

export default function Recipes() {
    const [recipes, setRecipes] = useState<RecipeInterface[]>(RecipeManager.fetchRecipes());
    const [isLoading, setIsLoading] = useState<boolean>(false); // État de chargement

    const handleGenerateRecipe = async () => {
        setIsLoading(true);
        try {
            await generateRecipe();
            setRecipes(RecipeManager.fetchRecipes());
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full bg-bg-color p-6 relative">
            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <p className="text-lg font-semibold">Génération de la recette en cours...</p>
                    </div>
                </div>
            )}

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
                <AddRecipeButton setRecipes={setRecipes} disabled={isLoading} />
                <ImportRecipeButton setRecipes={setRecipes} disabled={isLoading} />
                <GenerateAIRecipeButton handleGenerate={handleGenerateRecipe} disabled={isLoading} />
                {recipes.map((recipe: RecipeInterface, index: number) => (
                    <RecipeCard key={index} recipe={recipe} />
                ))}
            </div>
        </div>
    );
}
