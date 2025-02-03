import { useState } from "react";
import { BackButton, HomeButton } from "../components/buttons/BackAndHomeButton";
import TextualField from "../components/fields/TextualField";
import { SeasonEnum } from "../api/enums/SeasonEnum";
import LabeledSeasonSelectorField from "../components/fields/SeasonSelectorField";
import SwitchField from "../components/fields/SwitchField";

export default function RecipeGeneration() {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [localisation, setLocalisation] = useState<string>("");
    const [seasons, setSeasons] = useState<SeasonEnum[]>([]);
    const [ingredients, setIngredients] = useState<string>("");
    const [allergens, setAllergens] = useState<string>("");
    const [useBook, setUseBook] = useState<boolean>(false);

    const handleGenerateRecipe = async () => {
        setIsLoading(true);
        try {
            setTimeout(() => {
                alert("Recette générée !");
                setIsLoading(false);
            }, 2000);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full bg-bg-color p-6 relative">
            {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <p className="text-lg font-semibold">Génération de la recette en cours...</p>
                    </div>
                </div>
            )}

            <RecipeGenerationHeader />

            <div className="flex flex-col bg-primary p-4 rounded-lg">
                <TextualField
                    label={"Localité de la recette"}
                    placeholder={"La région Toulousaine"}
                    value={localisation}
                    onChange={(e) => setLocalisation(e.target.value)}
                />
                <LabeledSeasonSelectorField
                    seasons={seasons}
                    onChange={setSeasons}
                />
                <TextualField
                    label={"Centrer la recette autour d'ingrédients"}
                    placeholder={"Le poireau et les légumineuses"}
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                />
                <SwitchField
                    value={useBook}
                    onChange={(e) => setUseBook(e.target.checked)}
                    label={"S'inspirer de mon livre des recettes"}
                />
                <TextualField
                    label={"Retirer une liste d'allergènes"}
                    placeholder={"Le gluten et les fruits à coques"}
                    value={allergens}
                    onChange={(e) => setAllergens(e.target.value)}
                />
                <button
                    className="bg-confirmation-1 hover:bg-confirmation-2 hover:scale-95 text-text-primary p-2 rounded-lg w-[30vw] mx-auto transition duration-200"
                    onClick={handleGenerateRecipe}
                >
                    Générer une recette
                </button>
            </div>
        </div>
    );
}

function RecipeGenerationHeader() {
    return (
        <div className="flex items-center">
            <div className="relative flex items-center w-full p-2">
                <div className="flex items-center">
                    <BackButton />
                    <HomeButton />
                    <h1 className="text-lg lg:text-2xl xl:text-3xl font-bold text-text-primary ml-2">
                        Plan'Appétit
                    </h1>
                </div>
            </div>

            <h2 className="text-lg lg:text-2xl xl:text-3xl font-bold text-text-primary w-full h-min lg:text-left lg:-translate-x-10 xl:-translate-x-20">
                Génération de recette (IA)
            </h2>
        </div>
    )
}
