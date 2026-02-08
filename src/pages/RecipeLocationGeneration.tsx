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
import CreditPaywallModal from "../components/popups/CreditPaywallModal";
import RecipeGenerationLoadingModal from "../components/popups/RecipeGenerationLoadingModal";
import { usePostHog } from "../contexts/PostHogContext";
import { TrackingService } from "../api/services/TrackingService";

const DRAFT_STORAGE_KEY = "recipeGenerationDraft";

export default function RecipeLocationGeneration() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();
    const { trackEvent } = usePostHog();

    // Load draft from localStorage
    const loadDraft = () => {
        const draft = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (draft) {
            try {
                return JSON.parse(draft);
            } catch {
                return null;
            }
        }
        return null;
    };

    const draft = loadDraft();

    const [localisation, setLocalisation] = useState<string>(draft?.localisation || "");
    const [seasons, setSeasons] = useState<SeasonEnum[]>(draft?.seasons || []);
    const [ingredients, setIngredients] = useState<string>(draft?.ingredients || "");
    const [useBook, setUseBook] = useState<boolean>(draft?.useBook || false);
    const [vegan, setVegan] = useState<boolean>(draft?.vegan || false);
    const [allergens, setAllergens] = useState<string>(draft?.allergens || "");
    const [buyingPrice, setBuyingPrice] = useState<number>(draft?.buyingPrice || 10);

    // Modal state
    const [showCreditModal, setShowCreditModal] = useState<boolean>(false);

    // Save draft to localStorage whenever form changes
    useEffect(() => {
        const draftData = {
            localisation,
            seasons,
            ingredients,
            useBook,
            vegan,
            allergens,
            buyingPrice,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    }, [localisation, seasons, ingredients, useBook, vegan, allergens, buyingPrice]);

    const showModalRechargerCredits = () => {
        setShowCreditModal(true);
    };

    const handleGenerateRecipe = async () => {
        const generationInterface: RecipeGenerationParametersInterface = {
            localisation,
            seasons,
            ingredients,
            book: useBook,
            vegan,
            allergens,
            buyPrice: buyingPrice,
            sellingPrice: buyingPrice * 2, // Valeur par défaut : 2x le prix d'achat
        };

        trackEvent('recipe_generation_started', {
            localisation,
            seasons: seasons.join(', '),
            hasIngredients: !!ingredients,
            useBook,
            vegan,
            hasAllergens: !!allergens,
            buyingPrice,
        });

        setIsLoading(true);

        try {
            const email = localStorage.getItem("email") || "";
            const token = localStorage.getItem("firebaseIdToken") || "";
            const newRecipe = await generateRecipe(generationInterface, email, token);

            // Clear draft on successful generation
            localStorage.removeItem(DRAFT_STORAGE_KEY);

            // Naviguer vers la recette générée
            if (newRecipe) {
                trackEvent('recipe_generation_completed', {
                    recipeUuid: newRecipe.uuid,
                    localisation,
                    vegan,
                });
                TrackingService.logRecipeGenerated('localisation');
                TrackingService.promptATTIfNeeded();

                navigate(`/recettes/${newRecipe.uuid}`);
            }
        } catch (error: any) {
            if (error.type === "INSUFFICIENT_CREDITS") {
                trackEvent('quota_limit_reached', {
                    localisation,
                    vegan,
                });
                TrackingService.logQuotaLimitReached('localisation');
                TrackingService.logLead('localisation');
                showModalRechargerCredits();
                setIsLoading(false);
                return;
            }
            trackEvent('recipe_generation_failed', {
                error: error.message || 'Unknown error',
                localisation,
            });
            TrackingService.logRecipeGenerationFailed('localisation');
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
        <div className={`relative bg-bg-color min-h-screen ${isMobile ? 'px-4 pb-24 mobile-content-with-header' : 'p-6'}`}>
            <RecipeGenerationLoadingModal isOpen={isLoading} />

            {isMobile ? null : <RecipeGenerationHeader />}

            {/* Modal crédits épuisés */}
            <CreditPaywallModal
                isOpen={showCreditModal}
                onClose={() => setShowCreditModal(false)}
            />

            <div className="max-w-3xl mx-auto bg-primary shadow-lg rounded-xl p-6 md:p-8 mt-4">
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
                    label={"Coût par personne"}
                    value={buyingPrice}
                    onChange={(e) => setBuyingPrice(Number(e.target.value))}
                    isMobile={isMobile}
                />
                <button
                    className="w-full md:w-auto px-8 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300 shadow-lg mx-auto block mt-2"
                    onClick={handleGenerateRecipe}
                    disabled={isLoading}
                >
                    ✨ Générer ma recette
                </button>
            </div>
        </div>
    );
}

function RecipeGenerationHeader() {
    return (
        <Header
            back={true}
            pageName={"Génération par localité/saisonnalité"}
        />
    )
}
