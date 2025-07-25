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
        <div className="md:w-full md:bg-bg-color md:p-6">
            {isMobile ? null : <RecipeHeader />}
            <div className="bg-primary shadow-sm rounded-lg py-4 w-full mt-4 md:shadow-sm md:p-4 md:w-full">
                <div className={`mb-2 text-text-primary text-lg font-bold flex items-center justify-center md:ml-0 ${editMode ? "flex-col" : null}`}>
                    {editMode && !isMobile && (
                        <button
                            className="p-2 rounded-lg bg-cancel-1 absolute left-20 -translate-y-3 hover:bg-cancel-2 text-text-primary transition duration-200"
                            onClick={async () => {
                                await RecipeService.deleteRecipe(recipe.uuid)
                                setRecipes(RecipeService.fetchRecipesLocally())
                                navigate('/recettes')
                            }}
                        >
                            Supprimer
                        </button>
                    )}
                    <div className="flex items-center text-xl text-text-primary">
                        <div className="overflow-hidden max-w-[70vw] ">
                            {recipe.name}
                            <span> {editMode && isMobile && (
                                <button
                                    className="relative rotate-90 w-min h-min rounded-xl"
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
                            </span>
                        </div>
                    </div>
                    {editMode && !isMobile && (
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
                        <div className="text-text-primary">
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
                                className="w-10 mx-1 text-center text-text-secondary bg-thirdary"
                            />
                            {!isMobile ? "pers." : recipe.covers >= 2 ? "personnes" : "personne"}
                        </div>
                    ) : (
                        <div className="ml-1 text-sm text-text-primary">({recipe.covers} personne{recipe.covers > 1 && "s"})</div>
                    )}
                    {!isMobile &&
                        <button
                            className="-translate-y-3 bg-confirmation-1 hover:bg-confirmation-2 text-text-primary p-2 rounded-lg transition duration-200 absolute right-20"
                            onClick={async () => {
                                if (editMode) {
                                    await handleSaveRecipe(recipe)
                                }
                                setEditMode(!editMode);
                            }}
                        >
                            {editMode ? "Sauvegarder" : "Modifier"}
                        </button>
                    }
                </div>
                {!editMode ? (
                    <>
                        <DefaultMode recipe={recipe} isMobile={isMobile} />
                        {isMobile &&
                            <button
                                className="mt-4 bg-thirdary text-text-primary text-lg font-bold px-4 py-2 rounded-lg"
                                onClick={async () => {
                                    if (editMode) {
                                        await handleSaveRecipe(recipe)
                                    }
                                    setEditMode(!editMode);
                                }}
                            >
                                {(editMode && !isMobile) ? "Sauvegarder" : "Modifier"}
                            </button>
                        }
                        {isMobile ? null : <RecipeFooter recipe={recipe} />}
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <EditMode recipe={recipe} setRecipe={handleSetRepice} saveRecipe={handleSaveRecipe} isMobile={isMobile} />
                        {isMobile && (
                            <div className="flex items-center w-full px-2 justify-between">
                                <button
                                    className="p-2 rounded-lg bg-cancel-1 font-bold text-text-primary w-min"
                                    onClick={async () => {
                                        await RecipeService.deleteRecipe(recipe.uuid)
                                        setRecipes(RecipeService.fetchRecipesLocally())
                                        navigate('/recettes')
                                    }}
                                >
                                    Supprimer
                                </button>
                                <button
                                    className="p-2 rounded-lg bg-confirmation-1 font-bold text-text-primary w-min"
                                    onClick={async () => {
                                        await handleSaveRecipe(recipe)
                                        setEditMode(!editMode);
                                    }}
                                >
                                    Sauvegarder
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    ) : (
        <div className="w-full bg-bg-color p-6">
            {isMobile ? null : <RecipeHeader />}
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
        <div className="w-full text-text-secondary px-6 md:p-6 rounded-md bg-primary md:bg-secondary">
            <IngredientsList ingredients={recipe.ingredients} isMobile={isMobile} />
            <RecipeStepsList steps={recipe.steps} />
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
        <div className="w-full px-6 md:p-6 rounded-md bg-primary text-text-secondary">
            <IngredientsList
                ingredients={recipe.ingredients}
                recipeEditMode={editIngredients}
                setRecipeEditMode={setEditIngredients}
                onChange={handleChangeIngredient}
                onSave={handleSaveIngredients}
                isMobile={isMobile}
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
