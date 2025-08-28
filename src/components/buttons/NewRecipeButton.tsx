import { useNavigate } from "react-router-dom";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import RecipeService from "../../api/services/RecipeService";
import PremiumFeatureDisplayer from "../displayers/PremiumFeatureDisplayer";

export function AddRecipeButton({
    setRecipes,
    disabled
}: {
    setRecipes: (recipes: RecipeInterface[]) => void;
    disabled: boolean;
}) {
    const navigate = useNavigate();

    return (
        <button
            className="bg-confirmation-1 hover:bg-confirmation-2 border-6 border-blue-800 text-text-primary p-2 aspect-square rounded-md m-2 transition duration-200"
            disabled={disabled}
            onClick={async () => {
                try {
                    await RecipeService.addEmptyRecipe();
                    setRecipes(RecipeService.fetchRecipesLocally());
                } catch (err) {
                    console.error(err);
                    navigate('/login');
                }
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
            className="bg-green-500 hover:bg-green-600 border-6 border-green-700 text-text-primary p-2 aspect-square rounded-md m-2 transition duration-200"
        >
            Importer une recette
        </button>
    )
}

export function GenerateAIRecipeButton({
    disabled
}: {
    disabled: boolean;
}) {

    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/recettes/generer")}
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
