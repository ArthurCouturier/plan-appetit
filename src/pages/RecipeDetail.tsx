import { UUIDTypes } from "uuid";
import { useNavigate, useParams } from "react-router-dom";
import RecipeService from "../api/services/RecipeService";
import { useEffect, useState } from "react";
import RecipeInterface from "../api/interfaces/recipes/RecipeInterface";
import IngredientsList from "../components/lists/IngredientsList";
import IngredientInterface from "../api/interfaces/recipes/IngredientInterface";
import RecipeStepsList from "../components/lists/RecipeStepsList";
import StepInterface from "../api/interfaces/recipes/StepInterface";
import { ExportRecipeButton } from "../components/buttons/DataImportButtons";
import Header from "../components/global/Header";
import { useRecipeContext } from "../contexts/RecipeContext";
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon, UserGroupIcon } from "@heroicons/react/24/solid";

export default function RecipeDetail() {

    const navigate = useNavigate();
    const { uuid } = useParams<{ uuid: string }>();

    const [recipe, setRecipe] = useState<RecipeInterface | undefined>(RecipeService.getRecipe(uuid as UUIDTypes));
    const [editMode, setEditMode] = useState<boolean>(false);

    const handleSetRepice = async (recipe: RecipeInterface) => {
        setRecipe(recipe);
    }

    const handleSaveRecipe = async (recipe: RecipeInterface) => {
        const updateRecipe = await RecipeService.updateRecipe(recipe);
        setRecipe(updateRecipe);
        const updateRecipes = await RecipeService.fetchRecipesRemotly();
        setRecipes(updateRecipes);
    }

    const { setRecipes } = useRecipeContext();

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return recipe ? (
        <div className={`min-h-screen bg-bg-color ${isMobile ? 'px-4 pt-20 pb-24' : 'p-6'}`}>
            {!isMobile && <RecipeHeader />}
            
            {/* Recipe Title Card */}
            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-6 mt-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                            {recipe.name}
                            {editMode && (
                                <button
                                    onClick={async () => {
                                        const newRecipe = await RecipeService.changeRecipeName(recipe.uuid);
                                        if (newRecipe) setRecipe(newRecipe);
                                    }}
                                    className="ml-3 p-2 rounded-lg bg-secondary hover:bg-cout-purple/20 text-cout-base transition-colors"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                            )}
                        </h1>
                        <div className="flex items-center gap-2 text-text-secondary">
                            <UserGroupIcon className="w-5 h-5 text-cout-base" />
                            {editMode ? (
                                <div className="flex items-center gap-2">
                                    <span>Pour</span>
                                    <input
                                        type="number"
                                        value={recipe.covers}
                                        min={1}
                                        max={99}
                                        onChange={(e) => {
                                            const covers = parseInt(e.target.value);
                                            handleSetRepice({ ...recipe, covers: !covers ? 1 : Math.max(1, Math.min(covers, 99)) });
                                        }}
                                        className="w-16 px-2 py-1 text-center bg-secondary border border-border-color rounded-lg text-text-primary"
                                    />
                                    <span>personne{recipe.covers > 1 && "s"}</span>
                                </div>
                            ) : (
                                <span>{recipe.covers} personne{recipe.covers > 1 && "s"}</span>
                            )}
                        </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {editMode ? (
                            <>
                                <button
                                    onClick={async () => {
                                        await handleSaveRecipe(recipe);
                                        setEditMode(false);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-cout-base text-white rounded-lg hover:bg-cout-purple transition-colors"
                                >
                                    <CheckIcon className="w-5 h-5" />
                                    <span className="hidden md:inline">Sauvegarder</span>
                                </button>
                                <button
                                    onClick={() => setEditMode(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border-color text-text-primary rounded-lg hover:bg-red-500/10 transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                    <span className="hidden md:inline">Annuler</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-cout-yellow text-cout-purple font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                            >
                                <PencilIcon className="w-5 h-5" />
                                <span className="hidden md:inline">Modifier</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            {!editMode ? (
                <>
                    <DefaultMode recipe={recipe} isMobile={isMobile} />
                    
                    {/* Action Buttons Footer */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <ExportRecipeButton recipe={recipe} />
                        <button
                            onClick={async () => {
                                if (confirm(`Êtes-vous sûr de vouloir supprimer "${recipe.name}" ?`)) {
                                    await RecipeService.deleteRecipe(recipe.uuid);
                                    const updatedRecipes = await RecipeService.fetchRecipesRemotly();
                                    setRecipes(updatedRecipes);
                                    navigate('/recettes');
                                }
                            }}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary border-2 border-red-500/50 text-red-600 font-semibold rounded-xl hover:bg-red-500/10 transition-all duration-200"
                        >
                            <TrashIcon className="w-5 h-5" />
                            Supprimer la recette
                        </button>
                    </div>
                </>
            ) : (
                <EditMode recipe={recipe} setRecipe={handleSetRepice} saveRecipe={handleSaveRecipe} isMobile={isMobile} />
            )}
        </div>
    ) : (
        <div className={`min-h-screen bg-bg-color ${isMobile ? 'px-4 pt-20 pb-24' : 'p-6'}`}>
            {!isMobile && <RecipeHeader />}
            <RecipeError />
        </div>
    )
}

function RecipeHeader() {
    return (
        <Header
            back={true}
            home={true}
            title={true}
            profile={true}
        />
    )
}

function DefaultMode({ recipe, isMobile }: { recipe: RecipeInterface, isMobile: boolean }) {
    return (
        <div className="mt-6 space-y-6">
            {/* Ingredients Card */}
            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <span className="text-2xl">🧄</span>
                    Ingrédients
                </h2>
                <IngredientsList ingredients={recipe.ingredients} isMobile={isMobile} />
            </div>

            {/* Steps Card */}
            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <span className="text-2xl">👨‍🍳</span>
                    Étapes de préparation
                </h2>
                <RecipeStepsList steps={recipe.steps} />
            </div>
        </div>
    )
}

function EditMode({
    recipe,
    setRecipe,
    saveRecipe,
    isMobile
}: {
    recipe: RecipeInterface;
    setRecipe: (recipe: RecipeInterface) => void;
    saveRecipe: (recipe: RecipeInterface) => void;
    isMobile: boolean;
}) {

    const [editIngredients, setEditIngredients] = useState<boolean>(false);
    const [editSteps, setEditSteps] = useState<boolean>(false);

    const handleChangeIngredient = (updatedIngredients: IngredientInterface[]) => {
        setRecipe({ ...recipe, ingredients: updatedIngredients });
    }

    const handleAddStep = (updatedSteps: StepInterface[]) => {
        setRecipe({ ...recipe, steps: updatedSteps });
    }

    const handleSaveIngredients = (updatedIngredients: IngredientInterface[]) => {
        saveRecipe({ ...recipe, ingredients: updatedIngredients });
    }

    const handleSaveSteps = (updatedSteps: StepInterface[]) => {
        saveRecipe({ ...recipe, steps: updatedSteps });
    }

    return (
        <div className="mt-6 space-y-6">
            {/* Ingredients Edit Card */}
            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <span className="text-2xl">🧄</span>
                    Ingrédients
                    <span className="ml-auto text-sm font-normal text-cout-base">Mode édition</span>
                </h2>
                <IngredientsList
                    ingredients={recipe.ingredients}
                    recipeEditMode={editIngredients}
                    setRecipeEditMode={setEditIngredients}
                    onChange={handleChangeIngredient}
                    onSave={handleSaveIngredients}
                    isMobile={isMobile}
                />
            </div>

            {/* Steps Edit Card */}
            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-6">
                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                    <span className="text-2xl">👨‍🍳</span>
                    Étapes de préparation
                    <span className="ml-auto text-sm font-normal text-cout-base">Mode édition</span>
                </h2>
                <RecipeStepsList
                    steps={recipe.steps}
                    recipeEditMode={editSteps}
                    setRecipeEditMode={setEditSteps}
                    onChange={handleAddStep}
                    onSave={handleSaveSteps}
                />
            </div>
        </div>
    )
}


function RecipeError() {
    return (
        <div className="bg-primary rounded-xl shadow-lg border border-border-color p-12 mt-4 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
                Recette introuvable
            </h2>
            <p className="text-text-secondary">
                Cette recette n'existe pas ou a été supprimée.
            </p>
        </div>
    )
}
