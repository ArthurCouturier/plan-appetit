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
import StripeService from "../api/services/StripeService";
import { Product } from "../api/interfaces/stripe/Product";
import { CartItem } from "../api/interfaces/stripe/CartItem";
import { XMarkIcon, SparklesIcon, CreditCardIcon } from "@heroicons/react/24/solid";

const DRAFT_STORAGE_KEY = "recipeGenerationDraft";

export default function RecipeGeneration() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { setRecipes } = useRecipeContext();
    const navigate = useNavigate();

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
    const [sellingPrice, setSellingPrice] = useState<number>(draft?.sellingPrice || 20);

    // Modal state
    const [showCreditModal, setShowCreditModal] = useState<boolean>(false);
    const [premiumProduct, setPremiumProduct] = useState<Product | null>(null);
    const [credit20Product, setCredit20Product] = useState<Product | null>(null);

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
            sellingPrice,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    }, [localisation, seasons, ingredients, useBook, vegan, allergens, buyingPrice, sellingPrice]);

    // Load products for modal
    useEffect(() => {
        StripeService.fetchProduct(StripeService.PREMIUM_SUBSCRIPTION_MENSUAL)
            .then(product => setPremiumProduct(product));
        StripeService.fetchProduct(StripeService.CREDIT_TWENTY_RECIPES)
            .then(product => setCredit20Product(product));
    }, []);

    const showModalRechargerCredits = () => {
        setShowCreditModal(true);
    };

    const handleSubscribe = () => {
        if (!premiumProduct) return;
        const cart: CartItem = {
            priceId: premiumProduct.prices[0].stripePriceId,
            quantity: 1
        };
        StripeService.checkout([cart]);
    };

    const handleBuyCredits = () => {
        if (!credit20Product) return;
        const cart: CartItem = {
            priceId: credit20Product.prices[0].stripePriceId,
            quantity: 1
        };
        StripeService.checkout([cart]);
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
            sellingPrice,
        };

        setIsLoading(true);

        try {
            const email = localStorage.getItem("email") || "";
            const token = localStorage.getItem("firebaseIdToken") || "";
            const newRecipe = await generateRecipe(generationInterface, email, token);

            // Clear draft on successful generation
            localStorage.removeItem(DRAFT_STORAGE_KEY);

            // Mettre à jour le contexte avec les recettes actualisées
            if (newRecipe) {
                const updatedRecipes = await RecipeService.fetchRecipesRemotly();
                setRecipes(updatedRecipes);
                navigate(`/recettes/${newRecipe.uuid}`);
            }
        } catch (error: any) {
            if (error.type === "INSUFFICIENT_CREDITS") {
                showModalRechargerCredits();
                setIsLoading(false);
                return;
            }
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
        <div className="relative bg-bg-color min-h-screen md:p-6">
            {isLoading && (
                <div className="fixed inset-0 bg-cout-purple/95 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-6">
                            {/* Spinning circles */}
                            <div className="absolute inset-0 border-4 border-cout-yellow/30 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-transparent border-t-cout-yellow rounded-full animate-spin"></div>
                            <div className="absolute inset-2 border-4 border-transparent border-t-white rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>

                            {/* Center icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl animate-pulse">🍳</span>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Création en cours...</h3>
                        <p className="text-cout-yellow/90 text-lg">On vous cook ça...</p>
                        <div className="flex justify-center gap-1 mt-4">
                            <span className="w-2 h-2 bg-cout-yellow rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                            <span className="w-2 h-2 bg-cout-yellow rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-2 bg-cout-yellow rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                    </div>
                </div>
            )}

            {isMobile ? null : <RecipeGenerationHeader />}

            {/* Modal crédits épuisés */}
            {showCreditModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-primary rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-cout-base to-cout-purple p-6 rounded-t-2xl flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Crédits épuisés</h2>
                            </div>
                            <button
                                onClick={() => setShowCreditModal(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <p className="text-text-secondary text-center mb-6">
                                Rechargez vos crédits ou passez Premium pour générer des recettes illimitées
                            </p>

                            {/* Pricing Cards */}
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                {/* Premium Card */}
                                <div className="relative bg-gradient-to-br from-cout-base to-cout-purple p-6 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300">
                                    <div className="absolute -top-3 -right-3 bg-cout-yellow text-cout-purple px-3 py-1 rounded-full font-bold text-xs shadow-lg">
                                        ⭐ Recommandé
                                    </div>
                                    <div className="text-white">
                                        <div className="flex items-center gap-2 mb-2">
                                            <SparklesIcon className="w-6 h-6" />
                                            <h3 className="text-xl font-bold">Premium</h3>
                                        </div>
                                        <div className="text-3xl font-bold mb-3">
                                            {premiumProduct ? `${(premiumProduct.prices[0].unitAmount).toFixed(2)}€` : '...'}
                                            <span className="text-base font-normal">/mois</span>
                                        </div>
                                        <ul className="space-y-2 mb-6 text-sm">
                                            {[
                                                "Générations illimitées",
                                                "Personnalisation avancée",
                                                "Import Instagram (bientôt)",
                                                "Support prioritaire"
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <span className="text-cout-yellow">✓</span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={handleSubscribe}
                                            className="w-full py-3 bg-cout-yellow text-cout-purple font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg"
                                            disabled={!premiumProduct}
                                        >
                                            S'abonner
                                        </button>
                                    </div>
                                </div>

                                {/* Credits Card */}
                                <div className="bg-secondary border-2 border-border-color p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCardIcon className="w-6 h-6 text-cout-base" />
                                        <h3 className="text-xl font-bold text-text-primary">Pack Crédits</h3>
                                    </div>
                                    <div className="text-3xl font-bold text-text-primary mb-3">
                                        {credit20Product ? `${(credit20Product.prices[0].unitAmount).toFixed(2)}€` : '...'}
                                    </div>
                                    <ul className="space-y-2 mb-6 text-sm text-text-secondary">
                                        {[
                                            "20 crédits de génération",
                                            "Valables à vie",
                                            "Personnalisation standard",
                                            "Parfait pour essayer"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <span className="text-cout-base">✓</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        onClick={handleBuyCredits}
                                        className="w-full py-3 bg-cout-base text-white font-bold rounded-lg hover:bg-indigo-500 transition-all duration-300"
                                        disabled={!credit20Product}
                                    >
                                        Acheter
                                    </button>
                                </div>
                            </div>

                            {/* Bottom links */}
                            <div className="text-center space-y-3 pt-4 border-t border-border-color">
                                <button
                                    onClick={() => navigate('/premium')}
                                    className="text-cout-base hover:text-cout-purple font-semibold transition-colors"
                                >
                                    En savoir plus sur Premium →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
            pageName={"Génération de recette (IA)"}
        />
    )
}
