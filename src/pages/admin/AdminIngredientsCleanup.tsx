import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import useAuth from "../../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../../api/interfaces/users/UserInterface";
import AdminService from "../../api/services/AdminService";
import Modal from "../../components/modals/Modal";
import {
    AdminIngredientListItemDTO,
    AdminIngredientNeighborDTO,
    AdminIngredientNeighborsDTO,
    UpdateIngredientRequestBody,
} from "../../api/interfaces/admin/AdminIngredientCleanup";

const CATEGORY_OPTIONS = [
    "MEAT",
    "FISH",
    "VEGETABLE",
    "FRUIT",
    "DAIRY",
    "CEREAL",
    "SPICES",
    "HERB",
    "OTHER",
];

const PAGE_SIZE = 50;
const MAX_NAME_IN_LABEL = 20;

type MergeDirection = "absorbNeighbor" | "absorbSource";
type DeriveDirection = "neighborFromSource" | "sourceFromNeighbor";

type PendingMergeAction = {
    kind: "merge";
    direction: MergeDirection;
    neighbor: AdminIngredientNeighborDTO;
    deltaInput: string;
};

type PendingDeriveAction = {
    kind: "derive";
    direction: DeriveDirection;
    neighbor: AdminIngredientNeighborDTO;
    deltaInput: string;
};

type PendingAction = PendingMergeAction | PendingDeriveAction;

function truncateName(name: string, max: number = MAX_NAME_IN_LABEL): string {
    if (name.length <= max) return name;
    return `${name.slice(0, max - 1)}...`;
}

export default function AdminIngredientsCleanup() {
    const { user } = useAuth();

    const [items, setItems] = useState<AdminIngredientListItemDTO[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);

    const [qInput, setQInput] = useState("");
    const [q, setQ] = useState("");
    const [category, setCategory] = useState("");
    const [needsReviewOnly, setNeedsReviewOnly] = useState(false);
    const [derivedFromOnly, setDerivedFromOnly] = useState(false);

    const [selected, setSelected] = useState<AdminIngredientListItemDTO | null>(null);
    const [neighborsData, setNeighborsData] = useState<AdminIngredientNeighborsDTO | null>(null);
    const [neighborsLoading, setNeighborsLoading] = useState(false);
    const [neighborsError, setNeighborsError] = useState<string | null>(null);

    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const [editingIngredient, setEditingIngredient] =
        useState<AdminIngredientListItemDTO | null>(null);

    const debounceRef = useRef<number | null>(null);

    if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => {
            setQ(qInput.trim());
            setPage(0);
        }, 300);
        return () => {
            if (debounceRef.current) window.clearTimeout(debounceRef.current);
        };
    }, [qInput]);

    const fetchList = useCallback(async () => {
        setListLoading(true);
        setListError(null);
        try {
            const data = await AdminService.listIngredients({
                page,
                size: PAGE_SIZE,
                q: q || undefined,
                category: category || undefined,
                needsReviewOnly,
                derivedFromOnly,
            });
            setItems(data.items);
            setTotal(data.total);
        } catch (e) {
            setListError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setListLoading(false);
        }
    }, [page, q, category, needsReviewOnly, derivedFromOnly]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const fetchNeighbors = useCallback(async (uuid: string) => {
        setNeighborsLoading(true);
        setNeighborsError(null);
        try {
            const data = await AdminService.getIngredientNeighbors(uuid, 10);
            setNeighborsData(data);
        } catch (e) {
            setNeighborsError(e instanceof Error ? e.message : "Erreur inconnue");
            setNeighborsData(null);
        } finally {
            setNeighborsLoading(false);
        }
    }, []);

    const openDrawer = (item: AdminIngredientListItemDTO) => {
        setSelected(item);
        setNeighborsData(null);
        setNeighborsError(null);
        fetchNeighbors(item.uuid);
    };

    const closeDrawer = () => {
        setSelected(null);
        setNeighborsData(null);
        setNeighborsError(null);
    };

    const onResetPage = () => setPage(0);

    const handleFilterChange = (fn: () => void) => {
        fn();
        onResetPage();
    };

    const startMerge = (
        neighbor: AdminIngredientNeighborDTO,
        direction: MergeDirection
    ) => {
        setActionError(null);
        setPendingAction({
            kind: "merge",
            direction,
            neighbor,
            deltaInput: neighbor.suggestedDelta ?? "",
        });
    };

    const startDerive = (
        neighbor: AdminIngredientNeighborDTO,
        direction: DeriveDirection
    ) => {
        setActionError(null);
        setPendingAction({
            kind: "derive",
            direction,
            neighbor,
            deltaInput: neighbor.suggestedDelta ?? "",
        });
    };

    const cancelAction = () => {
        if (actionLoading) return;
        setPendingAction(null);
        setActionError(null);
    };

    const confirmMerge = async () => {
        if (!selected || !pendingAction || pendingAction.kind !== "merge") return;

        const sourceUuid =
            pendingAction.direction === "absorbNeighbor"
                ? pendingAction.neighbor.uuid
                : selected.uuid;
        const targetUuid =
            pendingAction.direction === "absorbNeighbor"
                ? selected.uuid
                : pendingAction.neighbor.uuid;
        const removedUuid = sourceUuid;

        setActionLoading(true);
        setActionError(null);
        try {
            await AdminService.mergeIngredientWithDelta(
                sourceUuid,
                targetUuid,
                pendingAction.deltaInput.trim().length > 0
                    ? pendingAction.deltaInput.trim()
                    : undefined
            );
            setItems((prev) => prev.filter((i) => i.uuid !== removedUuid));
            setTotal((t) => Math.max(0, t - 1));
            setPendingAction(null);
            if (removedUuid === selected.uuid) {
                closeDrawer();
            } else {
                await fetchNeighbors(selected.uuid);
            }
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setActionLoading(false);
        }
    };

    const confirmDerive = async () => {
        if (!selected || !pendingAction || pendingAction.kind !== "derive") return;
        const label = pendingAction.deltaInput.trim();
        if (label.length === 0) return;

        const childUuid =
            pendingAction.direction === "neighborFromSource"
                ? pendingAction.neighbor.uuid
                : selected.uuid;
        const parentUuid =
            pendingAction.direction === "neighborFromSource"
                ? selected.uuid
                : pendingAction.neighbor.uuid;

        setActionLoading(true);
        setActionError(null);
        try {
            await AdminService.deriveIngredientFrom(childUuid, parentUuid, label);
            setPendingAction(null);
            await fetchNeighbors(selected.uuid);
            fetchList();
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDismiss = async (neighbor: AdminIngredientNeighborDTO) => {
        if (!selected) return;
        const ok = window.confirm(
            `Séparer définitivement "${selected.name}" et "${neighbor.name}" ? Cette paire ne réapparaîtra plus.`
        );
        if (!ok) return;
        setActionLoading(true);
        setActionError(null);
        try {
            await AdminService.dismissIngredientPair(selected.uuid, neighbor.uuid);
            await fetchNeighbors(selected.uuid);
        } catch (e) {
            setActionError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setActionLoading(false);
        }
    };

    const applyIngredientUpdate = useCallback(
        (updated: AdminIngredientListItemDTO) => {
            setItems((prev) =>
                prev.map((i) => (i.uuid === updated.uuid ? { ...i, ...updated } : i))
            );

            setSelected((prev) =>
                prev && prev.uuid === updated.uuid ? { ...prev, ...updated } : prev
            );

            setNeighborsData((prev) => {
                if (!prev) return prev;
                const nextSource =
                    prev.source.uuid === updated.uuid
                        ? { ...prev.source, ...updated }
                        : prev.source;
                const nextNeighbors = prev.neighbors.map((n) =>
                    n.uuid === updated.uuid ? { ...n, ...updated } : n
                );
                return { ...prev, source: nextSource, neighbors: nextNeighbors };
            });
        },
        []
    );

    const openEdit = (ingredient: AdminIngredientListItemDTO) => {
        setEditingIngredient(ingredient);
    };

    const closeEdit = () => {
        setEditingIngredient(null);
    };

    const handleEditSuccess = (updated: AdminIngredientListItemDTO) => {
        applyIngredientUpdate(updated);
        setEditingIngredient(null);
    };

    const totalPages = useMemo(
        () => Math.max(1, Math.ceil(total / PAGE_SIZE)),
        [total]
    );

    let mergeModalTitle = "Confirmer le merge";
    let mergeModalBody: { from: string; into: string } | null = null;
    if (pendingAction && pendingAction.kind === "merge" && selected) {
        const from =
            pendingAction.direction === "absorbNeighbor"
                ? pendingAction.neighbor.name
                : selected.name;
        const into =
            pendingAction.direction === "absorbNeighbor"
                ? selected.name
                : pendingAction.neighbor.name;
        mergeModalTitle = `Merger ${truncateName(from)} dans ${truncateName(into)}`;
        mergeModalBody = { from, into };
    }

    let deriveModalTitle = "Marquer comme dérivé";
    let deriveModalBody: { child: string; parent: string } | null = null;
    if (pendingAction && pendingAction.kind === "derive" && selected) {
        const child =
            pendingAction.direction === "neighborFromSource"
                ? pendingAction.neighbor.name
                : selected.name;
        const parent =
            pendingAction.direction === "neighborFromSource"
                ? selected.name
                : pendingAction.neighbor.name;
        deriveModalTitle = `Marquer ${truncateName(child)} comme sous-partie de ${truncateName(parent)}`;
        deriveModalBody = { child, parent };
    }

    return (
        <div
            className="max-w-6xl mx-auto px-4 pb-20 space-y-6"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 5rem)" }}
        >
            <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">
                            Nettoyage des ingrédients
                        </h2>
                        <p className="text-sm text-text-secondary mt-1">
                            {total} ingrédient{total > 1 ? "s" : ""} au total
                        </p>
                    </div>
                    <button
                        onClick={fetchList}
                        disabled={listLoading}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border-color hover:bg-thirdary transition-colors disabled:opacity-50"
                    >
                        {listLoading ? "..." : "Rafraichir"}
                    </button>
                </div>

                <div className="sticky top-0 z-10 bg-primary pb-4 mb-4 border-b border-border-color">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                        <input
                            type="text"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                            placeholder="Recherche (nom)"
                            className="px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <select
                            value={category}
                            onChange={(e) =>
                                handleFilterChange(() => setCategory(e.target.value))
                            }
                            className="px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Toutes les catégories</option>
                            {CATEGORY_OPTIONS.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={needsReviewOnly}
                                onChange={(e) =>
                                    handleFilterChange(() =>
                                        setNeedsReviewOnly(e.target.checked)
                                    )
                                }
                            />
                            <span>Seulement needs_review</span>
                        </label>
                        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={derivedFromOnly}
                                onChange={(e) =>
                                    handleFilterChange(() =>
                                        setDerivedFromOnly(e.target.checked)
                                    )
                                }
                            />
                            <span>Seulement dérivés</span>
                        </label>
                    </div>
                </div>

                {listError && (
                    <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{listError}</p>
                    </div>
                )}

                {listLoading && items.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <p className="text-center text-text-secondary py-8">
                        Aucun ingrédient trouvé
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.map((item) => (
                            <IngredientCard
                                key={item.uuid}
                                item={item}
                                onClick={() => openDrawer(item)}
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-color">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0 || listLoading}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border-color hover:bg-thirdary transition-colors disabled:opacity-50"
                    >
                        Précédent
                    </button>
                    <span className="text-xs text-text-secondary">
                        Page {page + 1} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page + 1 >= totalPages || listLoading}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border-color hover:bg-thirdary transition-colors disabled:opacity-50"
                    >
                        Suivant
                    </button>
                </div>
            </div>

            {selected && (
                <NeighborsDrawer
                    source={selected}
                    neighborsData={neighborsData}
                    loading={neighborsLoading}
                    error={neighborsError}
                    actionError={actionError}
                    actionLoading={actionLoading}
                    onClose={closeDrawer}
                    onMerge={startMerge}
                    onDerive={startDerive}
                    onDismiss={handleDismiss}
                    onEditSource={() => openEdit(selected)}
                    onEditNeighbor={(n) => openEdit(n)}
                />
            )}

            {pendingAction &&
                selected &&
                pendingAction.kind === "merge" &&
                mergeModalBody && (
                    <Modal
                        isOpen
                        onClose={cancelAction}
                        title={mergeModalTitle}
                        size="md"
                    >
                        <div className="space-y-4">
                            <div className="text-sm text-text-primary space-y-2">
                                <p>
                                    Merger <strong>{mergeModalBody.from}</strong> dans{" "}
                                    <strong>{mergeModalBody.into}</strong>.
                                </p>
                                <p className="text-text-secondary text-xs">
                                    Toutes les occurrences de la source seront remplacées par la cible.
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">
                                    Le note de préparation ajouté aux recettes affectées
                                </label>
                                <input
                                    type="text"
                                    value={pendingAction.deltaInput}
                                    onChange={(e) =>
                                        setPendingAction({
                                            ...pendingAction,
                                            deltaInput: e.target.value,
                                        })
                                    }
                                    placeholder="Optionnel (ex: fondu)"
                                    className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    disabled={actionLoading}
                                />
                            </div>
                            {actionError && (
                                <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-xs text-red-700">{actionError}</p>
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={cancelAction}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border-color hover:bg-thirdary transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmMerge}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            En cours...
                                        </span>
                                    ) : (
                                        "Confirmer le merge"
                                    )}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

            {pendingAction &&
                selected &&
                pendingAction.kind === "derive" &&
                deriveModalBody && (
                    <Modal
                        isOpen
                        onClose={cancelAction}
                        title={deriveModalTitle}
                        size="md"
                    >
                        <div className="space-y-4">
                            <div className="text-sm text-text-primary space-y-2">
                                <p>
                                    Marquer <strong>{deriveModalBody.child}</strong> comme sous-partie de{" "}
                                    <strong>{deriveModalBody.parent}</strong>.
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">
                                    Libellé de la partie (requis)
                                </label>
                                <input
                                    type="text"
                                    value={pendingAction.deltaInput}
                                    onChange={(e) =>
                                        setPendingAction({
                                            ...pendingAction,
                                            deltaInput: e.target.value,
                                        })
                                    }
                                    placeholder="ex: haché, filet..."
                                    className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    disabled={actionLoading}
                                />
                            </div>
                            {actionError && (
                                <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-xs text-red-700">{actionError}</p>
                                </div>
                            )}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={cancelAction}
                                    disabled={actionLoading}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border-color hover:bg-thirdary transition-colors disabled:opacity-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDerive}
                                    disabled={
                                        actionLoading ||
                                        pendingAction.deltaInput.trim().length === 0
                                    }
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            En cours...
                                        </span>
                                    ) : (
                                        "Confirmer"
                                    )}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}

            {editingIngredient && (
                <EditIngredientModal
                    ingredient={editingIngredient}
                    onClose={closeEdit}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
}

function IngredientCard({
    item,
    onClick,
}: {
    item: AdminIngredientListItemDTO;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="text-left border border-border-color rounded-lg p-3 bg-secondary hover:bg-thirdary transition-colors"
        >
            <div className="flex items-center gap-2 flex-wrap">
                {item.emoji && (
                    <span className="text-xl leading-none">{item.emoji}</span>
                )}
                <p className="font-semibold text-text-primary truncate">{item.name}</p>
            </div>
            <p className="text-[11px] text-text-secondary font-mono mt-1 truncate">
                {item.nameNormalized}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                    {item.categoryCode}
                </span>
                <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                    {item.usageCount} utilisation{item.usageCount > 1 ? "s" : ""}
                </span>
                {item.needsReview && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-orange-100 text-orange-700 font-semibold">
                        needs_review
                    </span>
                )}
                {item.derivedFromUuid && (
                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700">
                        dérivé{item.derivedPartLabel ? ` (${item.derivedPartLabel})` : ""}
                    </span>
                )}
            </div>
        </button>
    );
}

function NeighborsDrawer({
    source,
    neighborsData,
    loading,
    error,
    actionError,
    actionLoading,
    onClose,
    onMerge,
    onDerive,
    onDismiss,
    onEditSource,
    onEditNeighbor,
}: {
    source: AdminIngredientListItemDTO;
    neighborsData: AdminIngredientNeighborsDTO | null;
    loading: boolean;
    error: string | null;
    actionError: string | null;
    actionLoading: boolean;
    onClose: () => void;
    onMerge: (
        neighbor: AdminIngredientNeighborDTO,
        direction: MergeDirection
    ) => void;
    onDerive: (
        neighbor: AdminIngredientNeighborDTO,
        direction: DeriveDirection
    ) => void;
    onDismiss: (neighbor: AdminIngredientNeighborDTO) => void;
    onEditSource: () => void;
    onEditNeighbor: (neighbor: AdminIngredientNeighborDTO) => void;
}) {
    return (
        <div
            className="fixed inset-0 z-40 flex justify-end bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="w-full sm:max-w-xl h-full bg-primary shadow-2xl overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                style={{
                    paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)",
                }}
            >
                <div className="flex items-center justify-between p-4 border-b border-border-color sticky top-0 bg-primary z-10">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            {source.emoji && (
                                <span className="text-xl leading-none">{source.emoji}</span>
                            )}
                            <h3 className="font-bold text-text-primary truncate">
                                {source.name}
                            </h3>
                            <button
                                onClick={onEditSource}
                                aria-label="Modifier l'ingrédient"
                                title="Modifier"
                                className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold rounded-md bg-secondary border border-border-color hover:bg-thirdary transition-colors"
                            >
                                <PencilIcon className="w-3.5 h-3.5" />
                                <span>Modifier</span>
                            </button>
                        </div>
                        <p className="text-[11px] text-text-secondary font-mono mt-1 truncate">
                            {source.nameNormalized}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Fermer"
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary"
                    >
                        <XMarkIcon className="w-5 h-5 text-text-primary" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                            {source.categoryCode}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                            {source.usageCount} utilisation{source.usageCount > 1 ? "s" : ""}
                        </span>
                        {source.needsReview && (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-orange-100 text-orange-700 font-semibold">
                                needs_review
                            </span>
                        )}
                        {source.derivedFromUuid && (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-purple-100 text-purple-700">
                                dérivé{source.derivedPartLabel ? ` (${source.derivedPartLabel})` : ""}
                            </span>
                        )}
                    </div>

                    {actionError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{actionError}</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wide">
                            Voisins les plus proches
                        </p>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : neighborsData && neighborsData.neighbors.length === 0 ? (
                            <p className="text-sm text-text-secondary italic">
                                Aucun voisin proche
                            </p>
                        ) : neighborsData ? (
                            <div className="space-y-3">
                                {neighborsData.neighbors.map((neighbor) => (
                                    <NeighborRow
                                        key={neighbor.uuid}
                                        source={source}
                                        neighbor={neighbor}
                                        disabled={actionLoading}
                                        onMerge={(direction) => onMerge(neighbor, direction)}
                                        onDerive={(direction) => onDerive(neighbor, direction)}
                                        onDismiss={() => onDismiss(neighbor)}
                                        onEdit={() => onEditNeighbor(neighbor)}
                                    />
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

function NeighborRow({
    source,
    neighbor,
    disabled,
    onMerge,
    onDerive,
    onDismiss,
    onEdit,
}: {
    source: AdminIngredientListItemDTO;
    neighbor: AdminIngredientNeighborDTO;
    disabled: boolean;
    onMerge: (direction: MergeDirection) => void;
    onDerive: (direction: DeriveDirection) => void;
    onDismiss: () => void;
    onEdit: () => void;
}) {
    const sourceNameShort = truncateName(source.name);
    const neighborNameShort = truncateName(neighbor.name);

    return (
        <div className="border border-border-color rounded-lg p-3 bg-secondary">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {neighbor.emoji && (
                            <span className="text-base leading-none">{neighbor.emoji}</span>
                        )}
                        <p className="text-sm font-medium text-text-primary truncate">
                            {neighbor.name}
                        </p>
                        <span className="text-[11px] text-text-secondary font-mono truncate">
                            {neighbor.nameNormalized}
                        </span>
                        <button
                            onClick={onEdit}
                            aria-label="Modifier le voisin"
                            title="Modifier"
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md bg-primary border border-border-color hover:bg-thirdary transition-colors"
                        >
                            <PencilIcon className="w-3 h-3" />
                            <span>Modifier</span>
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                            {neighbor.categoryCode}
                        </span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-orange-100 text-orange-700 font-semibold">
                            {Math.round(neighbor.score * 100)}%
                        </span>
                        <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                            {neighbor.usageCount} utilisation{neighbor.usageCount > 1 ? "s" : ""}
                        </span>
                        {neighbor.needsReview && (
                            <span className="px-2 py-0.5 text-[10px] rounded-full bg-orange-100 text-orange-700 font-semibold">
                                needs_review
                            </span>
                        )}
                    </div>
                    {neighbor.suggestedDelta && neighbor.suggestedDelta.length > 0 && (
                        <p className="text-[11px] text-text-secondary italic mt-1.5">
                            Delta suggéré: {neighbor.suggestedDelta}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onMerge("absorbNeighbor")}
                        disabled={disabled}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {`Merger ${neighborNameShort} dans ${sourceNameShort}`}
                    </button>
                    <button
                        onClick={() => onMerge("absorbSource")}
                        disabled={disabled}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary border border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {`Merger ${sourceNameShort} dans ${neighborNameShort}`}
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onDerive("neighborFromSource")}
                        disabled={disabled}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {`Marquer ${neighborNameShort} comme sous-partie de ${sourceNameShort}`}
                    </button>
                    <button
                        onClick={() => onDerive("sourceFromNeighbor")}
                        disabled={disabled}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary border border-purple-500 text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {`Marquer ${sourceNameShort} comme sous-partie de ${neighborNameShort}`}
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={onDismiss}
                        disabled={disabled}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border-color text-text-primary hover:bg-thirdary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Séparer définitivement
                    </button>
                </div>
            </div>
        </div>
    );
}

function EditIngredientModal({
    ingredient,
    onClose,
    onSuccess,
}: {
    ingredient: AdminIngredientListItemDTO;
    onClose: () => void;
    onSuccess: (updated: AdminIngredientListItemDTO) => void;
}) {
    const [name, setName] = useState(ingredient.name);
    const [emoji, setEmoji] = useState(ingredient.emoji ?? "");
    const [categoryCode, setCategoryCode] = useState(ingredient.categoryCode);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const trimmedName = name.trim();
    const canSubmit = trimmedName.length > 0 && !submitting;

    const buildBody = (): UpdateIngredientRequestBody => {
        const body: UpdateIngredientRequestBody = {};
        if (trimmedName !== ingredient.name) {
            body.name = trimmedName;
        }
        const trimmedEmoji = emoji.trim();
        const originalEmoji = ingredient.emoji ?? "";
        if (trimmedEmoji.length === 0 && originalEmoji.length > 0) {
            body.clearEmoji = true;
        } else if (trimmedEmoji.length > 0 && trimmedEmoji !== originalEmoji) {
            body.emoji = trimmedEmoji;
        }
        if (categoryCode !== ingredient.categoryCode) {
            body.categoryCode = categoryCode;
        }
        return body;
    };

    const handleClearEmoji = () => {
        setEmoji("");
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setError(null);

        const body = buildBody();

        if (Object.keys(body).length === 0) {
            onClose();
            return;
        }

        try {
            const updated = await AdminService.updateIngredient(ingredient.uuid, body);
            onSuccess(updated);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitting) return;
        onClose();
    };

    return (
        <Modal
            isOpen
            onClose={handleClose}
            title={`Modifier ${truncateName(ingredient.name, 30)}`}
            size="md"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Nom (requis)
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={submitting}
                        className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Emoji
                    </label>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={emoji}
                            onChange={(e) => setEmoji(e.target.value)}
                            disabled={submitting}
                            maxLength={8}
                            placeholder="ex: 🥕"
                            className="flex-1 px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                            type="button"
                            onClick={handleClearEmoji}
                            disabled={submitting || emoji.length === 0}
                            className="px-3 py-2 text-xs font-semibold rounded-lg bg-secondary border border-border-color hover:bg-thirdary transition-colors disabled:opacity-50"
                        >
                            Effacer
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                        Catégorie
                    </label>
                    <select
                        value={categoryCode}
                        onChange={(e) => setCategoryCode(e.target.value)}
                        disabled={submitting}
                        className="w-full px-3 py-2 rounded-lg border border-border-color bg-secondary text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-700">{error}</p>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border-color hover:bg-thirdary transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                En cours...
                            </span>
                        ) : (
                            "Confirmer"
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
