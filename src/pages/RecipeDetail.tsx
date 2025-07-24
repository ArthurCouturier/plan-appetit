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

export default function RecipeDetail() {

    const navigate = useNavigate();
    const { uuid } = useParams<{ uuid: string }>();

    const [recipe, setRecipe] = useState<RecipeInterface | undefined>(RecipeService.getRecipe(uuid as UUIDTypes));
    const [editMode, setEditMode] = useState<boolean>(false);

    const handleSetRepice = async (recipe: RecipeInterface) => {
        setRecipe(recipe);
    }

    const handleSaveRecipe = async (recipe: RecipeInterface) => {
        console.log("recipe before save");
        await RecipeService.updateRecipe(recipe);
        await RecipeService.fetchRecipesRemotly();
        setRecipes(RecipeService.fetchRecipesLocally());
    }

    const { recipes, setRecipes } = useRecipeContext();

    return recipe ? (
        <div className="w-full bg-bg-color p-6">
            <RecipeHeader />
            <div className="bg-primary shadow-sm rounded-lg p-4 w-full">
                <div className="p-4 mb-2 text-text-primary text-lg font-bold flex justify-center">
                    {editMode && (
                        <button
                            className="absolute left-20 -translate-y-3 bg-cancel-1 hover:bg-cancel-2 text-text-primary p-2 rounded-lg transition duration-200"
                            onClick={async () => {
                                await RecipeService.deleteRecipe(recipe.uuid)
                                setRecipes(RecipeService.fetchRecipesLocally())
                                navigate('/recettes')
                            }}
                        >
                            Supprimer
                        </button>
                    )}
                    <div className="flex">
                        <div className="overflow-hidden max-w-[70vw]">{recipe.name}</div>
                    </div>
                    {editMode && (
                        <button
                            className="relative rotate-90 rounded-full bg-thirdary p-1 mx-2 -translate-y-1"
                            onClick={async () => {
                                const newRecipe = await RecipeService.changeRecipeName(recipe.uuid);
                                if (newRecipe) {
                                    setRecipe(newRecipe);
                                }
                            }}
                        >
                            ✏️
                        </button>
                    )}
                    {editMode ? (
                        <div className="ml-1">
                            pour
                            <input
                                type="number"
                                value={recipe.covers}
                                min={0}
                                max={99}
                                onChange={(e) => {
                                    const covers = parseInt(e.target.value);
                                    handleSetRepice({ ...recipe, covers: !covers ? 0 : covers < 0 ? 0 : (covers > 99) ? 99 : covers });
                                }}
                                className="w-10 mx-1 text-center bg-thirdary text-text-secondary"
                            />
                            pers.
                        </div>
                    ) : (
                        <div className="ml-1">({recipe.covers} personne{recipe.covers > 1 && "s"})</div>
                    )}
                    <button
                        className="absolute right-20 -translate-y-3 bg-confirmation-1 hover:bg-confirmation-2 text-text-primary p-2 rounded-lg transition duration-200"
                        onClick={async () => {
                            if (editMode) {
                                await handleSaveRecipe(recipe)
                            }
                            setEditMode(!editMode);
                        }}
                    >
                        {editMode ? "Sauvegarder" : "Modifier"}
                    </button>
                </div>
                {!editMode ? (
                    <>
                        <DefaultMode recipe={recipe} />
                        <RecipeFooter recipe={recipe} />
                    </>
                ) : (
                    <EditMode recipe={recipe} setRecipe={handleSetRepice} saveRecipe={handleSaveRecipe} />
                )}
            </div>
        </div >
    ) : (
        <div className="w-full bg-bg-color p-6">
            <RecipeHeader />
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

function DefaultMode({ recipe }: { recipe: RecipeInterface }) {
    return (
        <div className="w-full bg-secondary text-text-secondary p-6 rounded-md">
            <IngredientsList ingredients={recipe.ingredients} />
            <RecipeStepsList steps={recipe.steps} />
        </div>
    )
}

function EditMode({
    recipe,
    setRecipe,
    saveRecipe,
}: {
    recipe: RecipeInterface;
    setRecipe: (recipe: RecipeInterface) => void;
    saveRecipe: (recipe: RecipeInterface) => void;
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
        <div className="w-full bg-secondary text-text-secondary p-6 rounded-md">
            <IngredientsList
                ingredients={recipe.ingredients}
                recipeEditMode={editIngredients}
                setRecipeEditMode={setEditIngredients}
                onChange={handleChangeIngredient}
                onSave={handleSaveIngredients}
            />
            <RecipeStepsList
                steps={recipe.steps}
                recipeEditMode={editSteps}
                setRecipeEditMode={setEditSteps}
                onChange={handleAddStep}
                onSave={handleSaveSteps}
            />
        </div>
    )
}

function RecipeFooter({ recipe }: { recipe: RecipeInterface }) {
    return (
        <div className="mt-4">
            <ExportRecipeButton recipe={recipe} />
        </div>
    )
}

function RecipeError() {
    return (
        <div className="flex bg-primary p-4 rounded-lg">
            <h2 className="text-text-primary text-3xl font-bold text-center w-full">
                Recette introuvable
            </h2>
        </div>
    )
}
