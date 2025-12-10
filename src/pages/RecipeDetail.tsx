import { useNavigate, useParams } from "react-router-dom";
import RecipeService from "../api/services/RecipeService";
import BackendService from "../api/services/BackendService";
import { useEffect, useState } from "react";
import RecipeInterface from "../api/interfaces/recipes/RecipeInterface";
import IngredientsList from "../components/lists/IngredientsList";
import RecipeStepsList from "../components/lists/RecipeStepsList";
import Header from "../components/global/Header";
import { TrashIcon, CheckIcon, UserGroupIcon, SparklesIcon, ArrowUpOnSquareIcon } from "@heroicons/react/24/solid";
import RecipeModificationModal from "../components/popups/RecipeModificationModal";
import PurchaseModificationCreditsModal from "../components/popups/PurchaseModificationCreditsModal";
import CreditPaywallModal from "../components/popups/CreditPaywallModal";
import RecipeImage from "../components/recipes/RecipeImage";

export default function RecipeDetail() {

    const navigate = useNavigate();
    const { uuid } = useParams<{ uuid: string }>();

    const [recipe, setRecipe] = useState<RecipeInterface | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [notFound, setNotFound] = useState<boolean>(false);

    const [isMobile, setIsMobile] = useState(false);

    const [showModificationModal, setShowModificationModal] = useState(false);
    const [showPurchaseCreditsModal, setShowPurchaseCreditsModal] = useState(false);
    const [showCreditPaywallModal, setShowCreditPaywallModal] = useState(false);
    const [userCredits, setUserCredits] = useState(0);
    const [modificationSuccess, setModificationSuccess] = useState(false);

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!uuid) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            try {
                const fetchedRecipe = await RecipeService.fetchRecipeByUuid(uuid);
                if (fetchedRecipe) {
                    setRecipe(fetchedRecipe);
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error('Erreur lors du chargement de la recette:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [uuid]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchUserCredits = async () => {
            const email = localStorage.getItem("email");
            const token = localStorage.getItem("firebaseIdToken");

            if (!email || !token) return;

            try {
                const credits = await BackendService.getUserCredits(email, token);
                setUserCredits(credits);
            } catch (error) {
                console.error("Erreur lors de la récupération des crédits:", error);
            }
        };
        fetchUserCredits();
    }, [showPurchaseCreditsModal]);

    useEffect(() => {
        if (modificationSuccess) {
            const timer = setTimeout(() => setModificationSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [modificationSuccess]);

    const handleOpenModificationModal = () => {
        if (recipe && recipe.remainingModifications <= 0) {
            setShowPurchaseCreditsModal(true);
        } else {
            setShowModificationModal(true);
        }
    };

    const handleModificationComplete = (modifiedRecipe: RecipeInterface) => {
        setRecipe(modifiedRecipe);
        setModificationSuccess(true);
    };

    const handlePurchaseComplete = (updatedRecipe: RecipeInterface) => {
        setRecipe(updatedRecipe);
        setShowModificationModal(true);
    };

    const handleShare = async () => {
        const shareUrl = window.location.href;
        const shareData = {
            title: recipe?.name || 'Recette Plan Appetit',
            text: `Découvrez cette recette : ${recipe?.name}`,
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Erreur lors du partage:', error);
                }
            }
        } else {
            await navigator.clipboard.writeText(shareUrl);
            alert('Lien copié dans le presse-papier !');
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen bg-bg-color ${isMobile ? 'px-4 pb-24 mobile-content-with-header' : 'p-6'}`}>
                {!isMobile && <RecipeHeader />}
                <div className="bg-primary rounded-xl shadow-lg border border-border-color p-12 mt-4 text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-cout-base border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-text-secondary">Chargement de la recette...</p>
                </div>
            </div>
        );
    }

    if (notFound || !recipe) {
        return (
            <div className={`min-h-screen bg-bg-color ${isMobile ? 'px-4 pb-24 mobile-content-with-header' : 'p-6'}`}>
                {!isMobile && <RecipeHeader />}
                <RecipeNotFound />
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-bg-color ${isMobile ? 'px-4 pb-24 mobile-content-with-header' : 'p-6'}`}>
            {!isMobile && <RecipeHeader />}

            {/* Recipe Title Card */}
            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-6 mt-4">
                <div className="flex items-center mb-4">
                    {/* Spacer gauche pour équilibrer */}
                    <div className="hidden md:flex flex-col gap-2 invisible">
                        {recipe.isOwner && (
                            <div className="px-4 py-2">
                                <span className="px-4">Assistant IA</span>
                            </div>
                        )}
                        <div className="px-4 py-2">
                            <span className="px-4">Partager</span>
                        </div>
                    </div>

                    {/* Titre centré */}
                    <div className="flex-1 text-center">
                        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                            {recipe.name}
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-text-secondary">
                            <UserGroupIcon className="w-5 h-5 text-cout-base" />
                            <span>{recipe.covers} personne{recipe.covers > 1 && "s"}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                        {recipe.isOwner && (
                            <button
                                onClick={handleOpenModificationModal}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cout-base to-cout-purple text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                <span className="hidden md:inline">Assistant IA</span>
                            </button>
                        )}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cout-base to-cout-purple text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                        >
                            <ArrowUpOnSquareIcon className="w-5 h-5" />
                            <span className="hidden md:inline">Partager</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Success Notification */}
            {modificationSuccess && (
                <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                    <CheckIcon className="w-5 h-5" />
                    Recette modifiée avec succès !
                </div>
            )}

            {/* Content - Mobile */}
            {isMobile && (
                <>
                    <RecipeImage
                        recipeUuid={recipe.uuid.toString()}
                        isGenerated={recipe.isGenerated}
                        isOwner={recipe.isOwner}
                        className="mt-4"
                    />
                    <RecipeContent recipe={recipe} isMobile={isMobile} />
                </>
            )}

            {/* Content - Desktop: Ingrédients à gauche (sticky), Image + Étapes à droite */}
            {!isMobile && (
                <div className="bg-primary rounded-xl shadow-lg border border-border-color p-6 mt-4">
                    <div className="flex gap-6">
                        {/* Colonne gauche : Ingrédients (sticky) */}
                        <div className="w-1/3 flex-shrink-0">
                            <div className="sticky top-6">
                                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🧄</span>
                                    Ingrédients
                                </h2>
                                <IngredientsList ingredients={recipe.ingredients} isMobile={false} />
                            </div>
                        </div>

                        {/* Colonne droite : Image + Étapes */}
                        <div className="flex-1 space-y-6">
                            {/* Image */}
                            <RecipeImage
                                recipeUuid={recipe.uuid.toString()}
                                isGenerated={recipe.isGenerated}
                                isOwner={recipe.isOwner}
                            />

                            {/* Étapes */}
                            <div>
                                <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                                    <span className="text-2xl">👨‍🍳</span>
                                    Étapes de préparation
                                </h2>
                                <RecipeStepsList steps={recipe.steps} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons Footer */}
            {recipe.isOwner && (
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                        onClick={async () => {
                            if (confirm(`Êtes-vous sûr de vouloir supprimer "${recipe.name}" ?`)) {
                                await RecipeService.deleteRecipe(recipe.uuid);
                                navigate('/recettes');
                            }
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary border-2 border-red-500/50 text-red-600 font-semibold rounded-xl hover:bg-red-500/10 transition-all duration-200"
                    >
                        <TrashIcon className="w-5 h-5" />
                        Supprimer la recette
                    </button>
                </div>
            )}

            {/* Modals */}
            <RecipeModificationModal
                isOpen={showModificationModal}
                onClose={() => setShowModificationModal(false)}
                recipe={recipe}
                onModificationComplete={handleModificationComplete}
                onInsufficientCredits={() => setShowPurchaseCreditsModal(true)}
            />

            <PurchaseModificationCreditsModal
                isOpen={showPurchaseCreditsModal}
                onClose={() => setShowPurchaseCreditsModal(false)}
                recipe={recipe}
                userCredits={userCredits}
                onPurchaseComplete={handlePurchaseComplete}
                onInsufficientCredits={() => {
                    setShowPurchaseCreditsModal(false);
                    setShowCreditPaywallModal(true);
                }}
            />

            <CreditPaywallModal
                isOpen={showCreditPaywallModal}
                onClose={() => setShowCreditPaywallModal(false)}
            />
        </div>
    );
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

function RecipeContent({ recipe, isMobile }: { recipe: RecipeInterface, isMobile: boolean }) {
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

function RecipeNotFound() {
    return (
        <div className="bg-primary rounded-xl shadow-lg border border-border-color p-12 mt-4 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
                Recette introuvable
            </h2>
            <p className="text-text-secondary">
                Désolé mais la recette que vous recherchez est introuvable ou privée.
            </p>
        </div>
    )
}
