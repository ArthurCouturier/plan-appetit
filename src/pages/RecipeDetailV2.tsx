import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RecipeV2DTO } from "../api/interfaces/v2/RecipeV2";
import RecipeV2Service, {
    RecipeV2ForbiddenError,
    RecipeV2NotFoundError,
} from "../api/services/RecipeV2Service";
import useAuth from "../api/hooks/useAuth";
import IngredientsListV2 from "../components/recipes-v2/IngredientsListV2";
import RecipeImageV2 from "../components/recipes-v2/RecipeImageV2";
import RecipeStepsListV2 from "../components/recipes-v2/RecipeStepsListV2";
import RecipeTimeFlipCardV2 from "../components/recipes-v2/RecipeTimeFlipCardV2";
import RecipeKeyTrickV2 from "../components/recipes-v2/RecipeKeyTrickV2";
import RecipeHeaderV2 from "../components/recipes-v2/RecipeHeaderV2";
import RecipeRemixButtonV2 from "../components/recipes-v2/RecipeRemixButtonV2";
import RecipeShareButtonV2 from "../components/recipes-v2/RecipeShareButtonV2";
import { isMeaningfulText } from "../components/recipes-v2/isMeaningfulText";

type LoadState =
    | { status: "loading" }
    | { status: "ok"; recipe: RecipeV2DTO }
    | { status: "not-found" }
    | { status: "forbidden" }
    | { status: "error"; message: string };

export default function RecipeDetailV2() {
    const { uuid } = useParams<{ uuid: string }>();
    const { user } = useAuth();

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

                <aside className="lg:[grid-area:aside] lg:sticky lg:top-6 lg:self-start">
                    <div className="bg-primary rounded-xl shadow-lg border border-border-color p-4 pb-2 md:p-6 md:pb-3">
                        <h2 className="text-lg font-bold text-text-primary mb-3 flex items-center gap-2">
                            <span className="text-xl" aria-hidden>🧄</span>
                            Ingrédients
                        </h2>
                        <div className="lg:max-h-[calc(100dvh_-_10rem)] lg:overflow-y-auto">
                            <IngredientsListV2 ingredients={recipe.ingredients} />
                        </div>
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

                {recipe.owner && (
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
            </div>
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
