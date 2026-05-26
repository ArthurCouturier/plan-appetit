import { useEffect, useMemo, useRef, useState } from "react";
import { useUserRecipesList } from "../../api/hooks/useUserRecipesList";
import { RitualDailyInterface } from "../../api/interfaces/ritual/RitualDailyInterface";
import { fuzzyFilter } from "../../api/utils/textSearch";
import { lightHaptic } from "../../haptics/light";
import RecipeRow from "./RecipeRow";

interface RecipePickerProps {
    headerLabel: string;
    selectedRecipeUuid: string | null;
    ritualSuggestions: RitualDailyInterface[];
    onCancel: () => void;
    onConfirm: (recipeUuid: string | null) => void;
    onBack: () => void;
}

export default function RecipePicker({
    headerLabel,
    selectedRecipeUuid,
    ritualSuggestions,
    onCancel,
    onConfirm,
    onBack,
}: RecipePickerProps) {
    const { recipes, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
        useUserRecipesList();
    const [search, setSearch] = useState("");
    const [pending, setPending] = useState<string | null>(selectedRecipeUuid);

    const togglePick = (uuid: string) => {
        setPending((p) => (p === uuid ? null : uuid));
        lightHaptic();
    };

    const ritualUuids = useMemo(
        () => new Set(ritualSuggestions.map((s) => s.recipeUuid)),
        [ritualSuggestions],
    );

    const otherRecipes = useMemo(
        () => recipes.filter((r) => !ritualUuids.has(r.uuid)),
        [recipes, ritualUuids],
    );

    const filteredOtherRecipes = useMemo(
        () => fuzzyFilter(otherRecipes, search, (r) => r.name),
        [otherRecipes, search],
    );

    const sentinelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || !hasNextPage || isFetchingNextPage) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    fetchNextPage();
                }
            },
            { rootMargin: "200px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="flex flex-col">
            <div className="px-3 py-2 flex items-center gap-2 shrink-0">
                <button
                    type="button"
                    onClick={() => { onBack(); lightHaptic(); }}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary border border-border-color text-text-primary text-sm"
                    aria-label="Retour"
                >
                    ←
                </button>
                <span className="text-sm font-semibold text-text-primary truncate">
                    {headerLabel}
                </span>
            </div>

            <div className="px-3 overflow-y-auto max-h-[60vh]">
                <button
                    type="button"
                    onClick={() => { onCancel(); lightHaptic(); }}
                    className="w-full mb-3 px-3 py-3 rounded-xl bg-secondary border border-border-color text-text-primary text-sm font-semibold text-left"
                >
                    🍽 J'ai mangé autre chose
                </button>

                {ritualSuggestions.length > 0 && (
                    <section className="mb-4">
                        <h3 className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                            Suggestions ritual du jour
                        </h3>
                        <div className="flex flex-col gap-2">
                            {ritualSuggestions.map((s) => (
                                <RecipeRow
                                    key={s.assignmentUuid}
                                    uuid={s.recipeUuid}
                                    name={s.recipeName}
                                    totalTimeMin={s.totalTimeMin}
                                    selected={pending === s.recipeUuid}
                                    onClick={() => togglePick(s.recipeUuid)}
                                />
                            ))}
                        </div>
                    </section>
                )}

                <section className="mb-4">
                    <h3 className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                        Mes recettes
                    </h3>
                    <div className="sticky top-0 z-10 bg-primary -mx-3 px-3 pb-2">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full px-4 py-2.5 bg-secondary border border-border-color rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-cout-yellow text-sm transition-colors"
                        />
                    </div>
                    {isLoading ? (
                        <p className="text-center text-text-secondary text-sm py-4">
                            Chargement…
                        </p>
                    ) : filteredOtherRecipes.length === 0 ? (
                        <p className="text-center text-text-secondary text-sm py-4">
                            {search.trim() ? "Aucun résultat" : "Aucune recette pour l'instant"}
                        </p>
                    ) : (
                        <>
                            <div className="flex flex-col gap-2">
                                {filteredOtherRecipes.map((r) => (
                                    <RecipeRow
                                        key={r.uuid}
                                        uuid={r.uuid}
                                        name={r.name}
                                        emoji={r.emoji}
                                        courseCode={r.courseCode}
                                        totalTimeMin={r.totalTimeMin}
                                        selected={pending === r.uuid}
                                        onClick={() => togglePick(r.uuid)}
                                    />
                                ))}
                            </div>
                            <div ref={sentinelRef} className="h-4" />
                            {isFetchingNextPage && (
                                <p className="text-center text-text-secondary text-xs py-2">
                                    Chargement…
                                </p>
                            )}
                        </>
                    )}
                </section>
            </div>

            <div className="px-3 py-2 shrink-0 border-t border-border-color">
                <button
                    type="button"
                    onClick={() => { onConfirm(pending); lightHaptic(); }}
                    className="w-full px-4 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold"
                >
                    Enregistrer
                </button>
            </div>
        </div>
    );
}
