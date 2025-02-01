import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import RecipeManager from "../../api/recipes/RecipeManager";
import PremiumFeatureDisplayer from "../displayers/PremiumFeatureDisplayer";

export function AddRecipeButton({
    setRecipes,
    disabled
}: {
    setRecipes: (recipes: RecipeInterface[]) => void;
    disabled: boolean;
}) {
    return (
        <button
            className="bg-confirmation-1 hover:bg-confirmation-2 text-text-primary p-2 aspect-square rounded-md m-2 transition duration-200"
            disabled={disabled}
            onClick={() => {
                RecipeManager.addEmptyRecipe();
                setRecipes(RecipeManager.fetchRecipes());
            }}
        >
            Ajouter une recette
        </button>
    )
}

export function ImportRecipeButtonDetail({
    handleImportClick,
    disabled
}: {
    handleImportClick: () => void;
    disabled: boolean;
}) {
    return (
        <button
            onClick={handleImportClick}
            disabled={disabled}
            className="bg-green-500 hover:bg-green-600 text-text-primary p-2 aspect-square rounded-md m-2 transition duration-200"
        >
            Importer une recette
        </button>
    )
}

export function GenerateAIRecipeButton({
    handleGenerate,
    disabled
}: {
    handleGenerate: () => void;
    disabled: boolean;
}) {
    return (
        <button
            onClick={handleGenerate}
            disabled={disabled}
            className={`relative bg-amber-300 hover:bg-amber-400 border-6 border-amber-700 text-text-primary p-2 aspect-square rounded-md m-2 transition duration-200 flex items-center justify-center ${disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
        >
            <div className="absolute -top-3 -left-3">
                <PremiumFeatureDisplayer />
            </div>

            Générer une recette
        </button>
    );
}
