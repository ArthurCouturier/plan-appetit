import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../../api/interfaces/users/UserInterface";
import AdminService from "../../api/services/AdminService";
import {
    AdminIngredientCandidateDTO,
    AdminIngredientReviewItemDTO,
} from "../../api/interfaces/admin/AdminIngredientReview";

type RowAction =
    | "accept"
    | "merge_into" // item → candidate
    | "merge_from" // candidate → item
    | "derive_from" // item part-of candidate
    | "derive_to" // candidate part-of item
    | "dismiss";

interface RowState {
    action: RowAction;
    targetUuid?: string;
}

export default function AdminIngredientsReview() {
    const { user } = useAuth();
    const [items, setItems] = useState<AdminIngredientReviewItemDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [rowStates, setRowStates] = useState<Record<string, RowState | undefined>>({});
    const [rowErrors, setRowErrors] = useState<Record<string, string | undefined>>({});

    if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
        return <Navigate to="/" replace />;
    }

    const fetchItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdminService.getIngredientsNeedingReview();
            setItems(data.items);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const clearRowError = (uuid: string) => {
        setRowErrors((prev) => {
            const next = { ...prev };
            delete next[uuid];
            return next;
        });
    };

    const setRowError = (uuid: string, message: string) => {
        setRowErrors((prev) => ({ ...prev, [uuid]: message }));
    };

    const removeItem = (uuid: string) => {
        setItems((prev) => prev.filter((i) => i.uuid !== uuid));
        setRowStates((prev) => {
            const next = { ...prev };
            delete next[uuid];
            return next;
        });
        clearRowError(uuid);
    };

    const removeCandidateFromItem = (itemUuid: string, candidateUuid: string) => {
        setItems((prev) =>
            prev.map((i) =>
                i.uuid === itemUuid
                    ? { ...i, candidates: i.candidates.filter((c) => c.uuid !== candidateUuid) }
                    : i
            )
        );
        setRowStates((prev) => {
            const next = { ...prev };
            delete next[itemUuid];
            return next;
        });
        clearRowError(itemUuid);
    };

    const runRowAction = async (
        item: AdminIngredientReviewItemDTO,
        action: RowAction,
        targetUuid: string | undefined,
        op: () => Promise<void>,
        onSuccess: () => void
    ) => {
        clearRowError(item.uuid);
        setRowStates((prev) => ({ ...prev, [item.uuid]: { action, targetUuid } }));
        try {
            await op();
            onSuccess();
        } catch (e) {
            setRowError(item.uuid, e instanceof Error ? e.message : "Erreur inconnue");
            setRowStates((prev) => {
                const next = { ...prev };
                delete next[item.uuid];
                return next;
            });
        }
    };

    const handleAccept = (item: AdminIngredientReviewItemDTO) =>
        runRowAction(
            item,
            "accept",
            undefined,
            () => AdminService.acceptIngredient(item.uuid).then(() => undefined),
            () => removeItem(item.uuid)
        );

    const handleMergeInto = (item: AdminIngredientReviewItemDTO, candidate: AdminIngredientCandidateDTO) =>
        runRowAction(
            item,
            "merge_into",
            candidate.uuid,
            () => AdminService.mergeIngredient(item.uuid, candidate.uuid).then(() => undefined),
            () => removeItem(item.uuid)
        );

    const handleMergeFrom = (item: AdminIngredientReviewItemDTO, candidate: AdminIngredientCandidateDTO) =>
        runRowAction(
            item,
            "merge_from",
            candidate.uuid,
            () => AdminService.mergeIngredient(candidate.uuid, item.uuid).then(() => undefined),
            // L'item courant absorbe le candidat : on retire le candidat de la ligne mais
            // on garde l'item visible (il peut encore être merged/accepted ensuite).
            () => removeCandidateFromItem(item.uuid, candidate.uuid)
        );

    const handleDerive = (
        item: AdminIngredientReviewItemDTO,
        candidate: AdminIngredientCandidateDTO,
        direction: "from" | "to"
    ) => {
        const childLabel = direction === "from" ? item.name : candidate.name;
        const parentLabel = direction === "from" ? candidate.name : item.name;
        const partLabel = window.prompt(
            `"${childLabel}" est-il une partie de "${parentLabel}" ?\n\nQuel label pour cette partie ? (ex: "feuille", "graine", "écorce")`,
            ""
        );
        if (partLabel === null || partLabel.trim().length === 0) return;

        const childUuid = direction === "from" ? item.uuid : candidate.uuid;
        const parentUuid = direction === "from" ? candidate.uuid : item.uuid;
        const action: RowAction = direction === "from" ? "derive_from" : "derive_to";

        runRowAction(
            item,
            action,
            candidate.uuid,
            () => AdminService.deriveIngredientFrom(childUuid, parentUuid, partLabel.trim()).then(() => undefined),
            // L'item est désormais validé (sortie de la review) : on retire la card.
            // Si le child est l'item courant on le supprime ; sinon, le candidat est "rangé"
            // et l'item reste à reviewer pour ses autres candidats — on retire seulement
            // ce candidat de la liste.
            () => (direction === "from" ? removeItem(item.uuid) : removeCandidateFromItem(item.uuid, candidate.uuid))
        );
    };

    const handleDismiss = (item: AdminIngredientReviewItemDTO, candidate: AdminIngredientCandidateDTO) =>
        runRowAction(
            item,
            "dismiss",
            candidate.uuid,
            () => AdminService.dismissIngredientPair(item.uuid, candidate.uuid).then(() => undefined),
            () => removeCandidateFromItem(item.uuid, candidate.uuid)
        );

    return (
        <div
            className="max-w-4xl mx-auto px-4 pb-20 space-y-6"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 5rem)" }}
        >
            <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">
                            Ingrédients à reviewer
                        </h2>
                        {!loading && (
                            <p className="text-sm text-text-secondary mt-1">
                                {items.length} ingrédient{items.length > 1 ? "s" : ""} à reviewer
                            </p>
                        )}
                    </div>
                    <button
                        onClick={fetchItems}
                        disabled={loading}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border-color hover:bg-thirdary transition-colors disabled:opacity-50"
                    >
                        {loading ? "..." : "Rafraichir"}
                    </button>
                </div>

                {error && (
                    <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {loading && items.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-center text-text-secondary py-8">
                        Aucun ingrédient à reviewer
                    </p>
                ) : (
                    <div className="space-y-4">
                        {items.map((item) => (
                            <IngredientReviewCard
                                key={item.uuid}
                                item={item}
                                rowState={rowStates[item.uuid]}
                                rowError={rowErrors[item.uuid]}
                                onAccept={() => handleAccept(item)}
                                onMergeInto={(candidate) => handleMergeInto(item, candidate)}
                                onMergeFrom={(candidate) => handleMergeFrom(item, candidate)}
                                onDeriveFrom={(candidate) => handleDerive(item, candidate, "from")}
                                onDeriveTo={(candidate) => handleDerive(item, candidate, "to")}
                                onDismiss={(candidate) => handleDismiss(item, candidate)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function IngredientReviewCard({
    item,
    rowState,
    rowError,
    onAccept,
    onMergeInto,
    onMergeFrom,
    onDeriveFrom,
    onDeriveTo,
    onDismiss,
}: {
    item: AdminIngredientReviewItemDTO;
    rowState: RowState | undefined;
    rowError: string | undefined;
    onAccept: () => void;
    onMergeInto: (candidate: AdminIngredientCandidateDTO) => void;
    onMergeFrom: (candidate: AdminIngredientCandidateDTO) => void;
    onDeriveFrom: (candidate: AdminIngredientCandidateDTO) => void;
    onDeriveTo: (candidate: AdminIngredientCandidateDTO) => void;
    onDismiss: (candidate: AdminIngredientCandidateDTO) => void;
}) {
    const busy = rowState !== undefined;
    const accepting = rowState?.action === "accept";

    return (
        <div className="border border-border-color rounded-lg p-4 bg-secondary">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {item.emoji && (
                            <span className="text-xl leading-none">{item.emoji}</span>
                        )}
                        <p className="font-semibold text-text-primary">{item.name}</p>
                        <span className="text-xs text-text-secondary font-mono">
                            {item.nameNormalized}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                            {item.categoryCode}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                            Utilisé dans {item.usageCount} recette
                            {item.usageCount > 1 ? "s" : ""}/listes
                        </span>
                    </div>
                    {item.reviewNotes && (
                        <p className="text-xs text-text-secondary mt-2 italic">
                            {item.reviewNotes}
                        </p>
                    )}
                </div>

                <button
                    onClick={onAccept}
                    disabled={busy}
                    className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-800 hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {accepting ? (
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            En cours...
                        </span>
                    ) : (
                        "Accepter tel quel"
                    )}
                </button>
            </div>

            {rowError && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs text-red-700">{rowError}</p>
                </div>
            )}

            <div className="mt-4">
                <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                    Candidats ({item.candidates.length})
                </p>
                {item.candidates.length === 0 ? (
                    <p className="text-xs text-text-secondary italic">
                        Aucun candidat proposé
                    </p>
                ) : (
                    <div className="space-y-2">
                        {item.candidates.map((candidate) => (
                            <CandidateRow
                                key={candidate.uuid}
                                item={item}
                                candidate={candidate}
                                rowState={rowState}
                                busy={busy}
                                onMergeInto={() => onMergeInto(candidate)}
                                onMergeFrom={() => onMergeFrom(candidate)}
                                onDeriveFrom={() => onDeriveFrom(candidate)}
                                onDeriveTo={() => onDeriveTo(candidate)}
                                onDismiss={() => onDismiss(candidate)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CandidateRow({
    item,
    candidate,
    rowState,
    busy,
    onMergeInto,
    onMergeFrom,
    onDeriveFrom,
    onDeriveTo,
    onDismiss,
}: {
    item: AdminIngredientReviewItemDTO;
    candidate: AdminIngredientCandidateDTO;
    rowState: RowState | undefined;
    busy: boolean;
    onMergeInto: () => void;
    onMergeFrom: () => void;
    onDeriveFrom: () => void;
    onDeriveTo: () => void;
    onDismiss: () => void;
}) {
    const isTarget = rowState?.targetUuid === candidate.uuid;
    const activeAction = isTarget ? rowState?.action : undefined;

    return (
        <div className="border border-border-color rounded-lg p-3 bg-primary">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {candidate.emoji && (
                            <span className="text-base leading-none">{candidate.emoji}</span>
                        )}
                        <p className="text-sm font-medium text-text-primary">{candidate.name}</p>
                        <span className="text-[11px] text-text-secondary font-mono">
                            {candidate.nameNormalized}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                            {candidate.categoryCode}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-orange-100 text-orange-700 font-semibold">
                            {Math.round(candidate.score * 100)}%
                        </span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                            {candidate.usageCount} utilisation
                            {candidate.usageCount > 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                <ActionButton
                    label={`« ${item.name} » → « ${candidate.name} »`}
                    color="orange"
                    busy={busy}
                    loading={activeAction === "merge_into"}
                    onClick={onMergeInto}
                    title={`Merge: l'item courant disparaît et est absorbé par "${candidate.name}"`}
                />
                <ActionButton
                    label={`« ${candidate.name} » → « ${item.name} »`}
                    color="orange"
                    busy={busy}
                    loading={activeAction === "merge_from"}
                    onClick={onMergeFrom}
                    title={`Merge inverse: "${candidate.name}" disparaît et est absorbé par l'item courant`}
                />
                <ActionButton
                    label={`« ${item.name} » est partie de « ${candidate.name} »`}
                    color="blue"
                    busy={busy}
                    loading={activeAction === "derive_from"}
                    onClick={onDeriveFrom}
                    title={`Déclarer l'item courant comme partie dérivée de "${candidate.name}"`}
                />
                <ActionButton
                    label={`« ${candidate.name} » est partie de « ${item.name} »`}
                    color="blue"
                    busy={busy}
                    loading={activeAction === "derive_to"}
                    onClick={onDeriveTo}
                    title={`Déclarer "${candidate.name}" comme partie dérivée de l'item courant`}
                />
                <ActionButton
                    label="Séparer (jamais re-suggérer)"
                    color="gray"
                    busy={busy}
                    loading={activeAction === "dismiss"}
                    onClick={onDismiss}
                    title="Marquer cette paire comme distincte (ne sera plus suggérée)"
                />
            </div>
        </div>
    );
}

function ActionButton({
    label,
    color,
    busy,
    loading,
    onClick,
    title,
}: {
    label: string;
    color: "orange" | "blue" | "gray";
    busy: boolean;
    loading: boolean;
    onClick: () => void;
    title: string;
}) {
    const colorClasses = {
        orange: "bg-orange-500 text-white hover:bg-orange-600",
        blue: "bg-blue-500 text-white hover:bg-blue-600",
        gray: "bg-thirdary text-text-secondary hover:bg-border-color",
    }[color];
    return (
        <button
            onClick={onClick}
            disabled={busy}
            title={title}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colorClasses}`}
        >
            {loading ? (
                <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ...
                </span>
            ) : (
                label
            )}
        </button>
    );
}
