import { ArrowPathIcon, PlusIcon, StarIcon, TrashIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    useDeleteShoppingItem,
    useDeleteShoppingList,
    useRenameShoppingList,
    useShoppingList,
    useUpdateShoppingItem,
} from "../api/hooks/useShoppingLists";
import { useActiveShoppingList } from "../api/hooks/useActiveShoppingList";
import { useUnsyncedShoppingList } from "../api/hooks/useUnsyncedShoppingList";
import { ShoppingListItemInterface, ShoppingListInterface } from "../api/interfaces/shopping/ShoppingListInterface";
import ShoppingListService from "../api/services/ShoppingListService";
import { isNetworkError } from "../api/offline/networkError";
import AddItemModal from "../components/shopping/AddItemModal";
import DeleteListConfirmModal from "../components/shopping/DeleteListConfirmModal";
import EditableShoppingListTitle from "../components/shopping/EditableShoppingListTitle";
import EyeToggleButton from "../components/shopping/EyeToggleButton";
import ReconcileModal from "../components/shopping/ReconcileModal";
import ShoppingItemRow from "../components/shopping/ShoppingItemRow";
import { formatIngredientCategoryV2 } from "../components/recipes-v2/recipeV2Labels";
import { errorHaptic } from "../haptics/error";
import { lightHaptic } from "../haptics/light";

const SHOW_CHECKED_KEY_PREFIX = "shoppingList:showChecked:";

function readShowCheckedFromStorage(uuid: string): boolean {
    const raw = localStorage.getItem(`${SHOW_CHECKED_KEY_PREFIX}${uuid}`);
    if (raw === null) return true;
    return raw === "true";
}

export default function ShoppingListPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const { data: list, isLoading, isError, refetch } = useShoppingList(uuid);
    const rename = useRenameShoppingList(uuid ?? "");
    const updateItem = useUpdateShoppingItem(uuid ?? "");
    const deleteItem = useDeleteShoppingItem(uuid ?? "");
    const deleteList = useDeleteShoppingList();
    const { activeUuid, setActiveUuid } = useActiveShoppingList();
    const mirror = useUnsyncedShoppingList(uuid);
    const isOffline = !!mirror;
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [showChecked, setShowChecked] = useState<boolean>(() =>
        uuid ? readShowCheckedFromStorage(uuid) : true,
    );
    const [showAdd, setShowAdd] = useState(false);
    const [reconcileState, setReconcileState] = useState<{ remote: ShoppingListInterface } | null>(null);
    const [reconcileError, setReconcileError] = useState<string | null>(null);
    const [resyncing, setResyncing] = useState(false);

    const startReconcile = async () => {
        if (!uuid || !mirror) return;
        lightHaptic();
        setReconcileError(null);
        setResyncing(true);
        try {
            const email = localStorage.getItem("email");
            const token = localStorage.getItem("firebaseIdToken");
            if (!email || !token) throw new Error("Non authentifié");
            const remote = await ShoppingListService.get(email, token, uuid);
            setReconcileState({ remote });
        } catch (err) {
            errorHaptic();
            if (isNetworkError(err)) {
                setReconcileError("Pas de réseau. Réessaie quand tu es reconnecté.");
            } else {
                setReconcileError(err instanceof Error ? err.message : "Erreur.");
            }
        } finally {
            setResyncing(false);
        }
    };

    useEffect(() => {
        if (uuid) setShowChecked(readShowCheckedFromStorage(uuid));
    }, [uuid]);

    const handleToggleShowChecked = (next: boolean) => {
        setShowChecked(next);
        if (uuid) localStorage.setItem(`${SHOW_CHECKED_KEY_PREFIX}${uuid}`, String(next));
    };

    const groupedByCategory = useMemo(() => {
        if (!list) return [] as { label: string; items: ShoppingListItemInterface[] }[];
        const visible = showChecked ? list.items : list.items.filter((it) => !it.checked);
        const byLabel = new Map<string, ShoppingListItemInterface[]>();
        for (const it of visible) {
            const label = formatIngredientCategoryV2(it.categoryCode || "OTHER");
            const bucket = byLabel.get(label) ?? [];
            bucket.push(it);
            byLabel.set(label, bucket);
        }
        return Array.from(byLabel.entries())
            .map(([label, items]) => ({ label, items }))
            .sort((a, b) => {
                if (a.label === "Autre" && b.label !== "Autre") return 1;
                if (b.label === "Autre" && a.label !== "Autre") return -1;
                return a.label.localeCompare(b.label, "fr");
            });
    }, [list, showChecked]);

    const toggleItem = (item: ShoppingListItemInterface) => {
        updateItem.mutate(
            { itemUuid: item.uuid, body: { checked: !item.checked } },
            { onError: () => errorHaptic() },
        );
    };

    const removeItem = (item: ShoppingListItemInterface) => {
        deleteItem.mutate(item.uuid, {
            onSuccess: () => lightHaptic(),
            onError: () => errorHaptic(),
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-bg-color px-4 pb-8 mobile-content-with-header">
                <p className="text-text-secondary text-sm">Chargement...</p>
            </div>
        );
    }

    if (isError || !list) {
        return (
            <div className="min-h-screen bg-bg-color px-4 pb-8 mobile-content-with-header flex flex-col items-center justify-center gap-3">
                <p className="text-text-secondary text-sm">Liste introuvable.</p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="px-4 py-2 rounded-full bg-cout-purple text-white font-semibold text-sm"
                >
                    Réessayer
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/shopping")}
                    className="text-text-secondary text-sm underline"
                >
                    Retour aux listes
                </button>
            </div>
        );
    }

    const isActive = activeUuid === list.uuid;

    return (
        <div className="min-h-screen bg-bg-color px-4 pb-24 mobile-content-with-header">
            <div className="max-w-md mx-auto pt-4 relative">
                <div className="pr-12">
                    <EditableShoppingListTitle
                        name={list.name}
                        onSave={(newName) =>
                            rename.mutate({ name: newName }, { onError: () => errorHaptic() })
                        }
                    />
                </div>
                <div className="absolute top-4 right-0">
                    <EyeToggleButton
                        showChecked={showChecked}
                        onToggle={handleToggleShowChecked}
                    />
                </div>

                {isOffline && (
                    <div className="mt-4 rounded-2xl bg-cancel-1/5 border border-cancel-1/30 p-3 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-cancel-1 uppercase tracking-wider">
                                Hors ligne
                            </span>
                            <span className="text-xs text-text-secondary">
                                Modifs en local. À resynchroniser quand le réseau revient.
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={startReconcile}
                            disabled={resyncing}
                            className="self-stretch inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-cout-yellow text-cout-purple text-xs font-bold disabled:opacity-50"
                        >
                            <ArrowPathIcon className={`w-3.5 h-3.5 ${resyncing ? "animate-spin" : ""}`} />
                            {resyncing ? "Vérif..." : "Resynchroniser"}
                        </button>
                    </div>
                )}
                {reconcileError && (
                    <p className="mt-2 text-xs text-cancel-1 text-center">{reconcileError}</p>
                )}

                <div className="mt-3 mb-6">
                    <button
                        type="button"
                        onClick={() => {
                            lightHaptic();
                            setActiveUuid(isActive ? null : list.uuid);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            isActive
                                ? "bg-cout-yellow text-cout-purple"
                                : "bg-secondary border border-border-color text-text-secondary hover:text-text-primary"
                        }`}
                    >
                        {isActive ? (
                            <StarIcon className="w-4 h-4" />
                        ) : (
                            <StarOutlineIcon className="w-4 h-4" />
                        )}
                        {isActive ? "Liste active" : "Définir comme active"}
                    </button>
                </div>

                {list.items.length === 0 && (
                    <div className="bg-secondary border border-border-color rounded-2xl p-6 text-center">
                        <p className="text-text-secondary text-sm">
                            Aucun article. Tape + pour en ajouter un.
                        </p>
                    </div>
                )}

                {groupedByCategory.map(({ label, items }) => (
                    <section key={label} className="mb-6">
                        <h2 className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                            {label} ({items.length})
                        </h2>
                        <ul className="flex flex-col gap-2">
                            {items.map((item) => (
                                <ShoppingItemRow
                                    key={item.uuid}
                                    item={item}
                                    onToggle={() => toggleItem(item)}
                                    onDelete={() => removeItem(item)}
                                />
                            ))}
                        </ul>
                    </section>
                ))}

                <div className="mt-8 pt-4 border-t border-border-color">
                    <button
                        type="button"
                        onClick={() => { lightHaptic(); setShowDeleteConfirm(true); }}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-transparent border-2 border-cancel-1 text-cancel-1 font-semibold text-sm hover:bg-cancel-1/10 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                        Supprimer cette liste
                    </button>
                </div>
            </div>

            <button
                type="button"
                onClick={() => {
                    lightHaptic();
                    setShowAdd(true);
                }}
                aria-label="Ajouter un article"
                className="fixed right-6 w-14 h-14 rounded-full bg-cout-yellow text-cout-purple shadow-lg flex items-center justify-center"
                style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
            >
                <PlusIcon className="w-7 h-7" />
            </button>

            {showAdd && uuid && (
                <AddItemModal listUuid={uuid} onClose={() => setShowAdd(false)} disableAutocomplete={isOffline} />
            )}

            {reconcileState && mirror && (
                <ReconcileModal
                    mirror={mirror}
                    remote={reconcileState.remote}
                    onClose={() => setReconcileState(null)}
                    onSuccess={() => setReconcileState(null)}
                />
            )}

            {showDeleteConfirm && (
                <DeleteListConfirmModal
                    listName={list.name}
                    isPending={deleteList.isPending}
                    onCancel={() => setShowDeleteConfirm(false)}
                    onConfirm={() => {
                        deleteList.mutate(list.uuid, {
                            onSuccess: () => {
                                lightHaptic();
                                setShowDeleteConfirm(false);
                                navigate("/shopping", { replace: true });
                            },
                            onError: () => errorHaptic(),
                        });
                    }}
                />
            )}
        </div>
    );
}
