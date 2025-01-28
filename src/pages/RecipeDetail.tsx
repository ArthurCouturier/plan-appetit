import { UUIDTypes } from "uuid";
import { useParams } from "react-router-dom";
import { BackButton, HomeButton } from "../components/buttons/BackAndHomeButton";
import RecipeManager from "../api/recipes/RecipeManager";
import { useState } from "react";
import RecipeInterface from "../api/interfaces/recipes/RecipeInterface";
import { Link } from "react-router-dom";
import IngredientsList from "../components/lists/IngredientsList";
import IngredientInterface from "../api/interfaces/recipes/IngredientInterface";
import RecipeStepsList from "../components/lists/RecipeStepsList";
import StepInterface from "../api/interfaces/recipes/StepInterface";
import { ExportRecipeButton } from "../components/buttons/DataImportButtons";

export default function RecipeDetail() {

    const { uuid } = useParams<{ uuid: string }>();

    const [recipe, setRecipe] = useState<RecipeInterface | undefined>(RecipeManager.getRecipe(uuid as UUIDTypes));
    const [editMode, setEditMode] = useState<boolean>(false);

    const handleSetRepice = (recipe: RecipeInterface) => {
        setRecipe(recipe);
        RecipeManager.updateRecipe(recipe);
    }

    return recipe ? (
        <div className="w-full bg-bgColor p-6">
            <RecipeHeader />
            <div className="bg-primary shadow rounded-lg p-4 w-full">
                <div className="p-4 mb-2 text-textPrimary text-lg font-bold flex justify-center">
                    {editMode && (
                        <Link to={"/recettes"}>
                            <button
                                className="absolute left-20 -translate-y-3 bg-cancel1 hover:bg-cancel2 text-textPrimary p-2 rounded-lg transition duration-200"
                                onClick={() => RecipeManager.deleteRecipe(recipe.uuid)}
                            >
                                Supprimer
                            </button>
                        </Link>
                    )}
                    <div className="overflow-hidden max-w-[70vw]">{recipe.name}</div>
                    {editMode && (
                        <button
                            className="relative rotate-90 rounded-full bg-secondary p-1 mx-2 -translate-y-1"
                            onClick={() => {
                                const newRecipe = RecipeManager.changeRecipeName(recipe.uuid);
                                if (newRecipe) {
                                    setRecipe(newRecipe);
                                }
                            }}
                        >
                            ✏️
                        </button>
                    )}
                    <button
                        className="absolute right-20 -translate-y-3 bg-confirmation1 hover:bg-confirmation2 text-textPrimary p-2 rounded-lg transition duration-200"
                        onClick={() => setEditMode(!editMode)}
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
                    <EditMode recipe={recipe} setRecipe={handleSetRepice} />
                )}
            </div>
        </div>
    ) : (
        <div className="w-full bg-bgColor p-6">
            <RecipeHeader />
            <RecipeError />
        </div>
    )
}

function RecipeHeader() {
    return (
        <div className="relative flex items-center w-full p-2">
            <div className="flex items-center">
                <BackButton />
                <HomeButton />
                <h1 className="text-3xl font-bold text-textPrimary ml-2">
                    Plan'Appétit
                </h1>
            </div>
        </div>
    )
}

function DefaultMode({ recipe }: { recipe: RecipeInterface }) {
    return (
        <div className="w-full bg-secondary text-textSecondary p-6 rounded-md">
            <IngredientsList ingredients={recipe.ingredients} />
            <RecipeStepsList steps={recipe.steps} />
        </div>
    )
}

function EditMode({
    recipe,
    setRecipe,
}: {
    recipe: RecipeInterface;
    setRecipe: (recipe: RecipeInterface) => void;
}) {

    const [editIngredients, setEditIngredients] = useState<boolean>(false);
    const [editSteps, setEditSteps] = useState<boolean>(false);

    const handleAddIngredient = (updatedIngredients: IngredientInterface[]) => {
        setRecipe({ ...recipe, ingredients: updatedIngredients });
    }

    const handleAddStep = (updatedSteps: StepInterface[]) => {
        setRecipe({ ...recipe, steps: updatedSteps });
    }

    return (
        <div className="w-full bg-secondary text-textSecondary p-6 rounded-md">
            <IngredientsList
                ingredients={recipe.ingredients}
                recipeEditMode={editIngredients}
                setRecipeEditMode={setEditIngredients}
                onChange={handleAddIngredient}
            />
            <RecipeStepsList
                steps={recipe.steps}
                recipeEditMode={editSteps}
                setRecipeEditMode={setEditSteps}
                onChange={handleAddStep}
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
            <h2 className="text-textPrimary text-3xl font-bold text-center w-full">
                Recette introuvable
            </h2>
        </div>
    )
}
