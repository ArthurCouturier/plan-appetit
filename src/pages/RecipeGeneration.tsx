import { useEffect, useState } from "react";
import TextualField from "../components/fields/TextualField";
import { SeasonEnum } from "../api/enums/SeasonEnum";
import LabeledSeasonSelectorField from "../components/fields/SeasonSelectorField";
import SwitchField from "../components/fields/SwitchField";
import { generateRecipe } from "../api/recipes/OpenAIRecipeGenerator";
import RecipeGenerationParametersInterface from "../api/interfaces/recipes/RecipeGenerationParametersInterface";
import LinearNumberField from "../components/fields/LinearNumberField";
import Header from "../components/global/Header";
import { useNavigate } from "react-router-dom";
import { useRecipeContext } from "../contexts/RecipeContext";
import RecipeService from "../api/services/RecipeService";

export default function RecipeGeneration() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { setRecipes } = useRecipeContext();

    const [localisation, setLocalisation] = useState<string>("");
    const [seasons, setSeasons] = useState<SeasonEnum[]>([]);
    const [ingredients, setIngredients] = useState<string>("");
    const [useBook, setUseBook] = useState<boolean>(false);
    const [vegan, setVegan] = useState<boolean>(false);
    const [allergens, setAllergens] = useState<string>("");
    const [buyingPrice, setBuyingPrice] = useState<number>(10);
    const [sellingPrice, setSellingPrice] = useState<number>(20);

    const navigate = useNavigate();

    const handleGenerateRecipe = async () => {
        const generationInterface: RecipeGenerationParametersInterface = {
            localisation,
            seasons,
            ingredients,
            book: useBook,
            vegan,
            allergens,
            buyPrice: buyingPrice,
            sellingPrice,
        };

        setIsLoading(true);

        try {
            const email = localStorage.getItem("email") || "";
            const token = localStorage.getItem("firebaseIdToken") || "";
            const newRecipe = await generateRecipe(generationInterface, email, token);
            
            // Mettre à jour le contexte avec les recettes actualisées
            if (newRecipe) {
                const updatedRecipes = await RecipeService.fetchRecipesRemotly();
                setRecipes(updatedRecipes);
                navigate(`/recettes/${newRecipe.uuid}`);
            }
        } catch (error) {
            console.error(error);
            alert("une erreur est surevenue")
            navigate('/myrecipes');

        } finally {
            setIsLoading(false);
        }
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative bg-primary shadow-sm rounded-lg py-4 w-full mt-4 md:bg-bg-color md:p-6 md:w-full">
            {isLoading && (
                <div className="md:absolute fixed inset-0 bg-black md:size-screen bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <p className="text-lg font-semibold">Génération de la recette en cours...</p>
                    </div>
                </div>
            )}

            {isMobile ? null : <RecipeGenerationHeader />}

            <div className="flex px-4 flex-col md:bg-primary md:py-4 md:rounded-lg">
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
                    uncheckedColor="red"
                    checkedColor="blue"
                    label={"S'inspirer de mon livre des recettes"}
                />
                <SwitchField
                    value={vegan}
                    onChange={(e) => setVegan(e.target.checked)}
                    uncheckedColor="red"
                    checkedColor="green"
                    label={"La recette doit être vegan"}
                />
                <TextualField
                    label={"Retirer une liste d'allergènes"}
                    placeholder={"Le gluten et les fruits à coques"}
                    value={allergens}
                    onChange={(e) => setAllergens(e.target.value)}
                />
                <LinearNumberField
                    label={"Prix d'achat par personne"}
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(Number(e.target.value))}
                    isMobile={isMobile}
                />
                <LinearNumberField
                    label={"Prix de vente par personne"}
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    isMobile={isMobile}
                />
                <button
                    className="bg-confirmation-1 font-bold md:font-normal hover:bg-confirmation-2 hover:scale-95 text-text-primary p-2 rounded-lg md:w-[30vw] mx-auto transition duration-200"
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
        <Header
            back={true}
            pageName={"Génération de recette (IA)"}
        />
    )
}
