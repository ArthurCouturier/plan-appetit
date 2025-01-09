import { UUIDTypes } from "uuid";
import { useParams } from "react-router-dom";
import { BackButton, HomeButton } from "../components/buttons/BackAndHomeButton";
import RecipeManager from "../api/recipes/RecipeManager";
import { useState } from "react";
import RecipeInterface from "../api/interfaces/recipes/RecipeInterface";
import { Link } from "react-router-dom";

export default function RecipeDetail() {

    const { uuid } = useParams<{ uuid: string }>();

    const [recipe, setRecipe] = useState<RecipeInterface | undefined>(RecipeManager.getRecipe(uuid as UUIDTypes));
    const [editMode, setEditMode] = useState<boolean>(false);

    return recipe ? (
        <div className="w-full bg-bgColor p-6">
            <div className="relative flex items-center w-full p-2">
                <div className="flex items-center">
                    <BackButton />
                    <HomeButton />
                    <h1 className="text-3xl font-bold text-textPrimary ml-2">
                        Plan'Appétit
                    </h1>
                </div>
            </div>
            <div className="bg-primary shadow rounded-lg p-4 w-full">
                <p className="p-4 mb-2 text-textPrimary text-lg font-bold">
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
                    {recipe.name}
                    {editMode && (
                        <button
                            className="relative rotate-90 rounded-full bg-secondary p-1 mx-2"
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
                        className="absolute right-20 -translate-y-3 bg-bgColor border-2 border-borderColor text-textPrimary p-2 rounded-lg"
                        onClick={() => setEditMode(!editMode)}
                    >
                        {editMode ? "Annuler" : "Modifier"}
                    </button>
                </p>
                {!editMode ? (
                    <DefaultMode recipe={recipe} />
                ) : (
                    <EditMode recipe={recipe} setRecipe={setRecipe} />
                )}
            </div>
        </div>
    ) : (
        <div className="w-full bg-bgColor p-6">
            <div className="relative flex items-center w-full p-2">
                <div className="flex items-center">
                    <BackButton />
                    <HomeButton />
                    <h1 className="text-3xl font-bold text-textPrimary ml-2">
                        Plan'Appétit
                    </h1>
                </div>
            </div>
            <div className="flex bg-primary p-4 rounded-lg">
                <h2 className="text-textPrimary text-3xl font-bold text-center w-full">
                    Recette introuvable
                </h2>
            </div>
        </div>
    )
}

function DefaultMode({ recipe }: { recipe: RecipeInterface }) {
    return (
        <div className="">
            <div className="w-full bg-secondary text-textSecondary p-6 rounded-md">
                Default Mode
            </div>
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
    return (
        <div className="w-full bg-secondary text-textSecondary p-6 rounded-md">
            Edit Mode
        </div>
    )
}
