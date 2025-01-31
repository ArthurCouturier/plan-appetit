import { useState } from "react";
import MenuButton from "../components/buttons/BackAndHomeButton";
import { getRecipe, RecipeType } from "../api/recipes/OpenAIRecipeGenerator";
import { ExportOpenAIRecipeButton } from "../components/buttons/DataImportButtons";

export default function Home() {
    const [recipe, setRecipe] = useState<RecipeType | null>(null);

    return (
        <div className="w-full">
            <div className="bg-bg-color p-6 rounded-md">
                <MenuButton link={"/planning"}>Configurer le planning</MenuButton>
                <MenuButton link={"/recettes"}>Livre des recettes</MenuButton>
                <button onClick={async () => {
                    const recipe = await getRecipe();
                    setRecipe(recipe);
                }}>
                    Générer une recette
                </button>
                {recipe && (
                    <div>
                        <h1>{recipe.name}</h1>
                        <p>{recipe.covers}</p>
                        <p>{recipe.buyPrice}</p>
                        <p>{recipe.sellPrice}</p>
                        <p>{recipe.promotion}</p>
                        <p>{recipe.course}</p>
                        <p>{recipe.season}</p>
                        <ul>
                            {recipe.ingredients.map((ingredient) => (
                                <li key={ingredient.uuid}>
                                    <p>{ingredient.name}</p>
                                    <p>{ingredient.category}</p>
                                    <p>{ingredient.quantity.value} {ingredient.quantity.unit}</p>
                                </li>
                            ))}
                        </ul>
                        <ol>
                            {recipe.steps.map((step) => (
                                <li key={step.key}>{step.value}</li>
                            ))}
                        </ol>
                        <ExportOpenAIRecipeButton />
                    </div>
                )}
            </div>
        </div>
    );
}
