import { useNavigate } from "react-router-dom";
import { PlusIcon, ArrowDownTrayIcon, SparklesIcon, FolderPlusIcon } from "@heroicons/react/24/solid";
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
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--confirmation-1)] hover:bg-[var(--confirmation-2)] text-white rounded-full font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={disabled}
            onClick={async () => {
                try {
                    await RecipeService.addEmptyRecipe();
                    const updatedRecipes = await RecipeService.fetchRecipesRemotly();
                    setRecipes(updatedRecipes);
                } catch (err) {
                    console.error(err);
                    navigate('/login');
                }
            }}
        >
            <PlusIcon className="w-5 h-5" />
            <span>Ajouter</span>
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
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
            <ArrowDownTrayIcon className="w-5 h-5" />
            <span>Importer</span>
        </button>
    )
}

export function GenerateAIRecipeButton({
    disabled,
    onClick
}: {
    disabled: boolean;
    onClick?: () => void;
}) {

    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate("/recettes/generer/localisation");
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`relative flex items-center gap-2 px-5 py-2.5 bg-premium-background hover:bg-amber-300 text-premium-text rounded-full font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 ${disabled ? "opacity-50 cursor-not-allowed hover:scale-100" : ""}`}
        >
            <div className="absolute -top-2 -right-2">
                <PremiumFeatureDisplayer />
            </div>
            <SparklesIcon className="w-5 h-5" />
            <span>Générer</span>
        </button>
    );
}

export function CreateCollectionButton({
    disabled,
    onClick
}: {
    disabled: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white rounded-full font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
            <FolderPlusIcon className="w-5 h-5" />
            <span>Collection</span>
        </button>
    );
}
