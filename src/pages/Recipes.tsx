import { HomeButton } from "../components/buttons/BackAndHomeButton";
import RecipeInterface from "../api/interfaces/recipes/RecipeInterface";
import { useState } from "react";
import RecipeManager from "../api/recipes/RecipeManager";
import RecipeCard from "../components/cards/RecipeCard";

export default function Recipes() {

    const [recipes, setRecipes] = useState<RecipeInterface[]>(RecipeManager.fetchRecipes());

    // const handleFetchRecipes = () => {
    //     setRecipes(RecipeManager.fetchRecipes());
    // }

    return (
        <div className="w-full bg-bg-color p-6">
            <div className="relative flex items-center w-full p-2">
                <div className="flex items-center">
                    <HomeButton />
                    <h1 className="text-3xl font-bold text-text-primary ml-2">
                        Plan'Appétit
                    </h1>
                </div>

                <h2 className="text-3xl font-bold text-text-primary text-center
                               absolute left-1/2 -translate-x-1/2">
                    Livre des recettes
                </h2>
            </div>

            <div className="grid grid-cols-5 bg-primary p-4 rounded-lg">
                <button
                    className="bg-confirmation-1 hover:bg-confirmation-2 text-text-primary p-2 aspect-square rounded-md m-2 transition duration-200"
                    onClick={() => {
                        RecipeManager.addEmptyRecipe();
                        setRecipes(RecipeManager.fetchRecipes());
                    }}
                >
                    Ajouter une recette
                </button>
                {recipes.map((recipe: RecipeInterface, index: number) => (
                    <RecipeCard key={index} recipe={recipe} />
                ))}
            </div>
        </div>
    );
}
