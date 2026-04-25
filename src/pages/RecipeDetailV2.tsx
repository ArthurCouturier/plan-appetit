import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeftIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";
import { RecipeV2DTO } from "../api/interfaces/v2/RecipeV2";
import RecipeV2Service, {
    RecipeV2ForbiddenError,
    RecipeV2NotFoundError,
} from "../api/services/RecipeV2Service";
import useIsMobile from "../hooks/useIsMobile";
import IngredientsListV2 from "../components/recipes-v2/IngredientsListV2";
import RecipeStepsListV2 from "../components/recipes-v2/RecipeStepsListV2";
import RecipeTimeBreakdownV2 from "../components/recipes-v2/RecipeTimeBreakdownV2";
import RecipeSeasonsV2 from "../components/recipes-v2/RecipeSeasonsV2";
import RecipeKeyTrickV2 from "../components/recipes-v2/RecipeKeyTrickV2";
import { formatCourseV2, formatPriceV2 } from "../components/recipes-v2/recipeV2Labels";

type LoadState =
    | { status: "loading" }
    | { status: "ok"; recipe: RecipeV2DTO }
    | { status: "not-found" }
    | { status: "forbidden" }
    | { status: "error"; message: string };

export default function RecipeDetailV2() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    const [state, setState] = useState<LoadState>({ status: "loading" });

    useEffect(() => {
        if (!uuid) {
            setState({ status: "not-found" });
            return;
        }
        let cancelled = false;
        setState({ status: "loading" });

        RecipeV2Service.getRecipe(uuid)
            .then((recipe) => {
                if (cancelled) return;
                setState({ status: "ok", recipe });
            })
            .catch((err: unknown) => {
                if (cancelled) return;
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
            });

        return () => {
            cancelled = true;
        };
    }, [uuid]);

    const containerClasses = `min-h-screen bg-bg-color ${
        isMobile ? "px-4 pb-24 mobile-content-with-header" : "p-6 max-w-5xl mx-auto"
    }`;

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
    const courseLabel = formatCourseV2(recipe.courseCode);
    const priceLabel = formatPriceV2(recipe.buyPrice, recipe.currency);
    const hasImageMetadata = recipe.images && recipe.images.length > 0;

    return (
        <div className={containerClasses}>
            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-4 md:p-6 mt-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex-shrink-0 p-2 rounded-lg bg-secondary hover:bg-cout-purple/20 text-cout-base transition-colors"
                        aria-label="Retour"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            {recipe.emoji && (
                                <span className="text-2xl" aria-hidden>
                                    {recipe.emoji}
                                </span>
                            )}
                            <h1 className="text-xl md:text-2xl font-bold text-text-primary truncate">
                                {recipe.name}
                            </h1>
                        </div>
                        {(courseLabel || priceLabel) && (
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-text-secondary">
                                {courseLabel && (
                                    <span className="px-2 py-0.5 rounded-full bg-cout-base/10 text-cout-base text-xs font-semibold uppercase tracking-wide">
                                        {courseLabel}
                                    </span>
                                )}
                                {priceLabel && (
                                    <span className="text-xs font-medium">
                                        Coût: {priceLabel}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <Link
                        to={`/sandbox?remix=${recipe.uuid}`}
                        className="flex-shrink-0 inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-cout-base to-cout-purple text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        <span className="hidden md:inline">Retravailler cette recette</span>
                        <span className="md:hidden text-sm">Retravailler</span>
                    </Link>
                </div>

                {recipe.description && (
                    <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                        {recipe.description}
                    </p>
                )}
            </div>

            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-4 md:p-6 mt-4">
                <div className="w-full rounded-lg bg-secondary/50 flex items-center justify-center py-12">
                    <span className="text-7xl" aria-hidden>
                        {recipe.emoji ?? "🍽️"}
                    </span>
                </div>
                {hasImageMetadata && (
                    <p className="text-xs text-text-secondary text-center mt-2">
                        {recipe.images.length} image{recipe.images.length > 1 ? "s" : ""} disponible{recipe.images.length > 1 ? "s" : ""}
                    </p>
                )}
            </div>

            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-4 md:p-6 mt-4">
                <h2 className="text-lg font-bold text-text-primary mb-3">
                    Temps et portions
                </h2>
                <RecipeTimeBreakdownV2
                    prepTimeMin={recipe.prepTimeMin}
                    cookTimeMin={recipe.cookTimeMin}
                    restTimeMin={recipe.restTimeMin}
                    totalTimeMin={recipe.totalTimeMin}
                    covers={recipe.covers}
                />
                {recipe.seasons && recipe.seasons.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-xs font-bold uppercase tracking-wide text-text-secondary mb-2">
                            Saisons
                        </h3>
                        <RecipeSeasonsV2 seasons={recipe.seasons} />
                    </div>
                )}
            </div>

            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-4 md:p-6 mt-4">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <span className="text-xl" aria-hidden>🧄</span>
                    Ingrédients
                </h2>
                <IngredientsListV2 ingredients={recipe.ingredients} />
            </div>

            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-4 md:p-6 mt-4">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <span className="text-xl" aria-hidden>👨‍🍳</span>
                    Étapes de préparation
                </h2>
                <RecipeStepsListV2 steps={recipe.steps} ingredients={recipe.ingredients} />
            </div>

            {(recipe.keyTrickFr || recipe.rescuePlanFr) && (
                <div className="mt-4">
                    <RecipeKeyTrickV2
                        keyTrickFr={recipe.keyTrickFr}
                        rescuePlanFr={recipe.rescuePlanFr}
                    />
                </div>
            )}

            {recipe.owner && (
                <div className="flex items-center justify-center gap-3 mt-6 p-4 bg-primary rounded-xl shadow-lg border border-border-color">
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
        </div>
    );
}

function RecipeDetailSkeleton() {
    return (
        <div className="space-y-4 mt-4">
            <div className="bg-primary rounded-xl shadow-lg border border-border-color p-6">
                <div className="h-6 w-2/3 bg-secondary rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-secondary rounded mt-3 animate-pulse" />
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
