import { PlusIcon, StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    useDeleteShoppingItem,
    useRenameShoppingList,
    useShoppingList,
    useUpdateShoppingItem,
} from "../api/hooks/useShoppingLists";
import { useActiveShoppingList } from "../api/hooks/useActiveShoppingList";
import { ShoppingListItemInterface } from "../api/interfaces/shopping/ShoppingListInterface";
import AddItemModal from "../components/shopping/AddItemModal";
import EditableShoppingListTitle from "../components/shopping/EditableShoppingListTitle";
import EyeToggleButton from "../components/shopping/EyeToggleButton";
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
    const { activeUuid, setActiveUuid } = useActiveShoppingList();

    const [showChecked, setShowChecked] = useState<boolean>(() =>
        uuid ? readShowCheckedFromStorage(uuid) : true,
    );
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        if (uuid) setShowChecked(readShowCheckedFromStorage(uuid));
    }, [uuid]);

    const handleToggleShowChecked = (next: boolean) => {
        setShowChecked(next);
        if (uuid) localStorage.setItem(`${SHOW_CHECKED_KEY_PREFIX}${uuid}`, String(next));
    };

    const groupedByCategory = useMemo(() => {
        if (!list) return [] as { category: string; label: string; items: ShoppingListItemInterface[] }[];
        const visible = showChecked ? list.items : list.items.filter((it) => !it.checked);
        const byCat = new Map<string, ShoppingListItemInterface[]>();
        for (const it of visible) {
            const cat = (it.categoryCode || "OTHER").toUpperCase();
            const bucket = byCat.get(cat) ?? [];
            bucket.push(it);
            byCat.set(cat, bucket);
        }
        return Array.from(byCat.entries())
            .map(([category, items]) => ({
                category,
                label: formatIngredientCategoryV2(category),
                items,
            }))
            .sort((a, b) => a.label.localeCompare(b.label, "fr"));
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

                {groupedByCategory.map(({ category, label, items }) => (
                    <section key={category} className="mb-6">
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
                <AddItemModal listUuid={uuid} onClose={() => setShowAdd(false)} />
            )}
        </div>
    );
}
