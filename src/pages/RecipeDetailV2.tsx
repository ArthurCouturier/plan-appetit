import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { TrashIcon, BookmarkIcon } from "@heroicons/react/24/solid";
import { RecipeV2DTO } from "../api/interfaces/v2/RecipeV2";
import RecipeV2Service, {
    RecipeV2ForbiddenError,
    RecipeV2NotFoundError,
} from "../api/services/RecipeV2Service";
import RecipeService from "../api/services/RecipeService";
import CollectionService from "../api/services/CollectionService";
import BackendService from "../api/services/BackendService";
import useAuth from "../api/hooks/useAuth";
import { useInvalidateCollections } from "../api/hooks/useCollectionMutations";
import { useRitualDailyRange } from "../api/hooks/useRitualDaily";
import { localIsoDate } from "../utils/dateUtils";
import { dispatchFeedbackEvent } from "../components/feedbacks/feedbackEvents";
import IngredientsListV2 from "../components/recipes-v2/IngredientsListV2";
import AddToShoppingListButtonV2 from "../components/recipes-v2/AddToShoppingListButtonV2";
import RecipeImageV2 from "../components/recipes-v2/RecipeImageV2";
import RecipeStepsListV2 from "../components/recipes-v2/RecipeStepsListV2";
import RecipeTimeFlipCardV2 from "../components/recipes-v2/RecipeTimeFlipCardV2";
import RecipeKeyTrickV2 from "../components/recipes-v2/RecipeKeyTrickV2";
import RecipeHeaderV2 from "../components/recipes-v2/RecipeHeaderV2";
import RecipeRemixButtonV2 from "../components/recipes-v2/RecipeRemixButtonV2";
import RecipeShareButtonV2 from "../components/recipes-v2/RecipeShareButtonV2";
import RecipeModificationModal from "../components/modals/RecipeModificationModal";
import PurchaseModificationCreditsModal from "../components/modals/PurchaseModificationCreditsModal";
import CreditPaywallModal from "../components/modals/CreditPaywallModal";
import SaveToCollectionModal from "../components/modals/SaveToCollectionModal";
import { isMeaningfulText } from "../components/recipes-v2/isMeaningfulText";
import { TrackingService } from "../api/tracking/TrackingService";

type LoadState =
    | { status: "loading" }
    | { status: "ok"; recipe: RecipeV2DTO }
    | { status: "not-found" }
    | { status: "forbidden" }
    | { status: "error"; message: string };

export default function RecipeDetailV2() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isFromShare = searchParams.has("share");
    const { user } = useAuth();
    const invalidateCollections = useInvalidateCollections();

    const [state, setState] = useState<LoadState>({ status: "loading" });
    const [showModificationModal, setShowModificationModal] = useState(false);
    const [showPurchaseCreditsModal, setShowPurchaseCreditsModal] = useState(false);
    const [showCreditPaywallModal, setShowCreditPaywallModal] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [userCredits, setUserCredits] = useState(0);

    const fetchRecipe = useCallback(async (recipeUuid: string) => {
        try {
            const recipe = await RecipeV2Service.getRecipe(recipeUuid);
            setState({ status: "ok", recipe });
        } catch (err: unknown) {
            if (err instanceof RecipeV2NotFoundError) {
                setState({ status: "not-found" });
                return;
            }
            if (err instanceof RecipeV2ForbiddenError) {
                setState({ status: "forbidden" });
                return;
            }
            const message = err instanceof Error ? err.message : "Erreur inconnue";
            setState({ status: "error", message });
        }
    }, []);

    useEffect(() => {
        if (!uuid) {
            setState({ status: "not-found" });
            return;
        }
        setState({ status: "loading" });
        fetchRecipe(uuid).then(() => TrackingService.logViewContent(uuid));
    }, [uuid, fetchRecipe]);

    useEffect(() => {
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("firebaseIdToken");
        if (!email || !token) return;
        BackendService.getUserCredits(email, token).then(setUserCredits).catch(() => undefined);
    }, [showPurchaseCreditsModal]);

    const today = useMemo(() => localIsoDate(), []);
    const ritualRange = useRitualDailyRange(today, today);
    const dispatchedForUuidRef = useRef<string | null>(null);
    useEffect(() => {
        if (state.status !== "ok") return;
        const data = ritualRange.data;
        if (!data) return;
        if (dispatchedForUuidRef.current === state.recipe.uuid) return;
        const isDailyRitual = data.some((assignment) => assignment.recipeUuid === state.recipe.uuid);
        if (!isDailyRitual) return;
        dispatchedForUuidRef.current = state.recipe.uuid;
        dispatchFeedbackEvent("ritual_recipe_opened");
    }, [state, ritualRange.data]);

    const handleModificationComplete = async () => {
        if (uuid) await fetchRecipe(uuid);
    };

    const handlePurchaseComplete = async () => {
        if (uuid) await fetchRecipe(uuid);
        setShowModificationModal(true);
    };

    const handleDelete = async () => {
        if (state.status !== "ok") return;
        if (!confirm(`Êtes-vous sûr de vouloir supprimer "${state.recipe.name}" ?`)) return;
        await RecipeService.deleteRecipe(state.recipe.uuid);
        // Rafraîchit en direct les collections montées (ex: la collection de la home) pour que
        // la recette supprimée disparaisse sans attendre un remontage.
        invalidateCollections();
        navigate("/recettes");
    };

    const handleRemoveFromCollection = async () => {
        if (state.status !== "ok") return;
        if (!confirm(`Retirer "${state.recipe.name}" de ma collection ?`)) return;
        await CollectionService.removeRecipeFromLibrary(state.recipe.uuid);
        // Met à jour en direct les collections montées (comme une suppression).
        invalidateCollections();
        // On repasse en mode "lien partagé" : la recette n'est plus dans la librairie, on
        // réaffiche le bouton "Enregistrer dans..." pour pouvoir la ré-ajouter.
        navigate(`/recipes-v2/${state.recipe.uuid}?share`, { replace: true });
    };

    const handleSaveToCollection = () => {
        const token = localStorage.getItem("firebaseIdToken");
        if (!token) {
            navigate("/login");
            return;
        }
        setShowSaveModal(true);
    };

    const containerClasses = "min-h-screen bg-bg-color px-4 pb-24 mobile-content-with-header lg:px-8 lg:max-w-7xl lg:mx-auto";

    if (state.status === "loading") {
        return (
            <div className={containerClasses}>
                <RecipeDetailSkeleton />
            </div>
        );
    }

    if (state.status === "not-found") {
        return (
            <div className={containerClasses}>
                <ErrorPanel
                    title="Recette introuvable"
                    message="Désolé, la recette que vous recherchez n'existe pas ou a été supprimée."
                />
            </div>
        );
    }

    if (state.status === "forbidden") {
        return (
            <div className={containerClasses}>
                <ErrorPanel
                    title="Cette recette est privée"
                    message="Le propriétaire n'a pas autorisé l'accès public à cette recette."
                />
            </div>
        );
    }

    if (state.status === "error") {
        return (
            <div className={containerClasses}>
                <ErrorPanel
                    title="Erreur de chargement"
                    message={state.message}
                />
            </div>
        );
    }

    const recipe = state.recipe;
    const isOwner = !!recipe.userUid && !!user?.uid && recipe.userUid === user.uid;
    const hasAnyTime =
        (recipe.totalTimeMin ?? 0) > 0 ||
        (recipe.prepTimeMin ?? 0) > 0 ||
        (recipe.cookTimeMin ?? 0) > 0 ||
        (recipe.restTimeMin ?? 0) > 0;

    return (
        <div className={containerClasses}>
            {/*
              Mobile : empilement vertical (ordre du DOM).
              Desktop (lg) : grid 2 colonnes [300px_1fr] avec aside ingrédients sticky à gauche.
              Colonne droite : header → image → bouton remix → steps → keytrick → owner.
              Card temps desktop : absolute, ancrée à la cell `header` du grid, centrée
              verticalement sur le header card, collée à droite extrême de la colonne.
            */}
            <div className="pt-4 space-y-4 lg:space-y-0 lg:grid lg:grid-cols-[300px_1fr] lg:gap-x-8 lg:gap-y-4 lg:items-start lg:[grid-template-areas:'aside_header'_'aside_image'_'aside_steps'_'aside_owner']">
                {/* Header card + panneau actions desktop (card temps top / partage middle / retravailler bottom) */}
                <div className="lg:[grid-area:header] lg:relative">
                    <div className="lg:max-w-[calc(100%-16rem)] lg:mr-auto">
                        <RecipeHeaderV2 name={recipe.name} description={recipe.description} />
                    </div>

                    <div className="hidden lg:flex lg:absolute lg:inset-y-0 lg:right-0 lg:w-56 lg:flex-col lg:gap-3 lg:items-stretch lg:z-10">
                        {hasAnyTime && (
                            <RecipeTimeFlipCardV2
                                prepTimeMin={recipe.prepTimeMin}
                                cookTimeMin={recipe.cookTimeMin}
                                restTimeMin={recipe.restTimeMin}
                                totalTimeMin={recipe.totalTimeMin}
                            />
                        )}

                        <RecipeShareButtonV2 recipeName={recipe.name} fullWidth className="flex-1" />
                        <RecipeRemixButtonV2 recipeUuid={recipe.uuid} fullWidth className="flex-1" />
                    </div>
                </div>

                <div className="lg:[grid-area:image]">
                    <RecipeImageV2
                        recipeUuid={recipe.uuid}
                        isOwner={isOwner}
                        emoji={recipe.emoji}
                    />
                </div>

                {/* Mobile only : entre image et ingrédients.
                    - Avec temps : grid 2 colonnes (gauche = card temps, droite = boutons), même hauteur.
                    - Sans temps : les boutons prennent toute la largeur. */}
                {hasAnyTime ? (
                    <div className="lg:hidden grid grid-cols-2 gap-3 items-stretch">
                        <RecipeTimeFlipCardV2
                            prepTimeMin={recipe.prepTimeMin}
                            cookTimeMin={recipe.cookTimeMin}
                            restTimeMin={recipe.restTimeMin}
                            totalTimeMin={recipe.totalTimeMin}
                            stretchHeight
                        />
                        <div className="flex flex-col gap-2 h-full">
                            <RecipeShareButtonV2 recipeName={recipe.name} fullWidth className="flex-1" />
                            <RecipeRemixButtonV2 recipeUuid={recipe.uuid} fullWidth className="flex-1" />
                        </div>
                    </div>
                ) : (
                    <div className="lg:hidden flex flex-col gap-2">
                        <RecipeShareButtonV2 recipeName={recipe.name} fullWidth />
                        <RecipeRemixButtonV2 recipeUuid={recipe.uuid} fullWidth />
                    </div>
                )}

                {isFromShare && !isOwner && (
                    <div className="lg:col-start-2">
                        <button
                            onClick={handleSaveToCollection}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cout-base to-cout-purple text-white font-semibold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                        >
                            <BookmarkIcon className="w-5 h-5" />
                            Enregistrer dans...
                        </button>
                    </div>
                )}

                <aside className="lg:[grid-area:aside] lg:sticky lg:top-6 lg:self-start">
                    <div className="bg-primary rounded-xl shadow-lg border border-border-color p-4 pb-2 md:p-6 md:pb-3">
                        <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-xl" aria-hidden>🧄</span>
                            Ingrédients
                        </h2>
                        <div className="lg:max-h-[calc(100dvh_-_10rem)] lg:overflow-y-auto">
                            <IngredientsListV2 ingredients={recipe.ingredients} />
                        </div>
                        <AddToShoppingListButtonV2
                            recipeUuid={recipe.uuid}
                            recipeName={recipe.name}
                        />
                    </div>
                </aside>

                <div className="lg:[grid-area:steps]">
                    <div className="bg-primary rounded-xl shadow-lg border border-border-color p-4 md:p-6">
                        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                            <span className="text-xl" aria-hidden>👨‍🍳</span>
                            Étapes de préparation
                        </h2>
                        {(isMeaningfulText(recipe.keyTrickFr) || isMeaningfulText(recipe.rescuePlanFr)) && (
                            <div className="mb-4">
                                <RecipeKeyTrickV2
                                    keyTrickFr={recipe.keyTrickFr}
                                    rescuePlanFr={recipe.rescuePlanFr}
                                />
                            </div>
                        )}
                        <RecipeStepsListV2 steps={recipe.steps} ingredients={recipe.ingredients} />
                    </div>
                </div>

                {!isOwner && !isFromShare && (
                    <div className="lg:col-start-2">
                        <button
                            onClick={handleRemoveFromCollection}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary border-2 border-red-500/50 text-red-600 font-semibold rounded-xl hover:bg-red-500/10 transition-all duration-200"
                        >
                            <TrashIcon className="w-5 h-5" />
                            Retirer de ma collection
                        </button>
                    </div>
                )}

                {recipe.owner && !isOwner && (
                    <div className="lg:[grid-area:owner] flex items-center justify-center gap-3 p-4 bg-primary rounded-xl shadow-lg border border-border-color">
                        <span className="text-text-secondary text-sm">Recette de</span>
                        <span className="text-text-primary font-semibold">
                            {recipe.owner.displayName ?? "Utilisateur"}
                        </span>
                        {recipe.owner.profilePhotoUrl ? (
                            <img
                                src={recipe.owner.profilePhotoUrl}
                                alt={recipe.owner.displayName ?? "Propriétaire"}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-cout-base flex items-center justify-center text-white font-semibold text-sm">
                                {(recipe.owner.displayName ?? "?").charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                )}

                {isOwner && (
                    <div className="lg:col-start-2 mt-2">
                        <button
                            onClick={handleDelete}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary border-2 border-red-500/50 text-red-600 font-semibold rounded-xl hover:bg-red-500/10 transition-all duration-200"
                        >
                            <TrashIcon className="w-5 h-5" />
                            Supprimer la recette
                        </button>
                    </div>
                )}
            </div>

            <RecipeModificationModal
                isOpen={showModificationModal}
                onClose={() => setShowModificationModal(false)}
                recipeUuid={recipe.uuid}
                remainingModifications={recipe.remainingModifications}
                onComplete={handleModificationComplete}
                onInsufficientCredits={() => setShowPurchaseCreditsModal(true)}
            />

            <PurchaseModificationCreditsModal
                isOpen={showPurchaseCreditsModal}
                onClose={() => setShowPurchaseCreditsModal(false)}
                recipeUuid={recipe.uuid}
                userCredits={userCredits}
                onPurchaseComplete={handlePurchaseComplete}
                onInsufficientCredits={() => {
                    setShowPurchaseCreditsModal(false);
                    setShowCreditPaywallModal(true);
                }}
            />

            {showCreditPaywallModal && (
                <CreditPaywallModal onClose={() => setShowCreditPaywallModal(false)} trigger="insufficient_credits" />
            )}

            <SaveToCollectionModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                recipeUuid={recipe.uuid}
                onSaved={() => {
                    if (uuid) fetchRecipe(uuid);
                }}
            />
        </div>
    );
}

function RecipeDetailSkeleton() {
    return (
        <div className="space-y-4 mt-4">
            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-6">
                <div className="h-6 w-2/3 bg-secondary rounded animate-pulse mx-auto" />
                <div className="h-4 w-1/3 bg-secondary rounded mt-3 animate-pulse mx-auto" />
            </div>
            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-6">
                <div className="h-48 w-full bg-secondary rounded animate-pulse" />
            </div>
            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-6">
                <div className="h-5 w-1/4 bg-secondary rounded animate-pulse" />
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-20 bg-secondary rounded animate-pulse" />
                    ))}
                </div>
            </div>
            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-6">
                <div className="h-5 w-1/3 bg-secondary rounded animate-pulse" />
                <div className="space-y-2 mt-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-4 w-full bg-secondary rounded animate-pulse" />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ErrorPanel({ title, message }: { title: string; message: string }) {
    return (
        <div className="bg-primary rounded-xl shadow-lg border border-border-color p-12 mt-4 text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-2">{title}</h2>
            <p className="text-text-secondary mb-6">{message}</p>
            <Link
                to="/"
                className="inline-block px-4 py-2 bg-cout-base text-white font-semibold rounded-lg hover:bg-cout-base/80 transition-colors"
            >
                Retour à l'accueil
            </Link>
        </div>
    );
}
