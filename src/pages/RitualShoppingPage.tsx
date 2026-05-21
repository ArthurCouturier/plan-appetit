import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    useCreateShoppingItem,
    useDeleteShoppingItem,
    useRitualShoppingList,
    useUpdateShoppingItem,
} from "../api/hooks/useRitualShopping";
import {
    RitualShoppingItemInterface,
    SHOPPING_ITEM_NAME_MAX_LENGTH,
    SHOPPING_ITEM_UNIT_MAX_LENGTH,
    ShoppingRecurrence,
} from "../api/interfaces/ritual/RitualShoppingInterface";
import Modal from "../components/modals/Modal";
import { lightHaptic } from "../haptics/light";
import { errorHaptic } from "../haptics/error";

const RECURRENCE_LABELS: Record<ShoppingRecurrence, string> = {
    ONCE: "Une fois",
    WEEKLY: "Chaque semaine",
    BIWEEKLY: "Toutes les 2 semaines",
    MONTHLY: "Chaque mois",
};

const DAY_OPTIONS: { value: number; label: string }[] = [
    { value: 1, label: "Lundi" },
    { value: 2, label: "Mardi" },
    { value: 3, label: "Mercredi" },
    { value: 4, label: "Jeudi" },
    { value: 5, label: "Vendredi" },
    { value: 6, label: "Samedi" },
    { value: 7, label: "Dimanche" },
];

export default function RitualShoppingPage() {
    const navigate = useNavigate();
    const list = useRitualShoppingList();
    const updateItem = useUpdateShoppingItem();
    const deleteItem = useDeleteShoppingItem();
    const [showAdd, setShowAdd] = useState(false);

    const grouped = useMemo(() => {
        const items = list.data ?? [];
        return {
            todo: items.filter((i) => !i.checked),
            done: items.filter((i) => i.checked),
        };
    }, [list.data]);

    const toggle = (item: RitualShoppingItemInterface) => {
        updateItem.mutate(
            { uuid: item.uuid, body: { checked: !item.checked } },
            {
                onError: () => errorHaptic(),
                onSuccess: () => lightHaptic(),
            },
        );
    };

    const remove = (item: RitualShoppingItemInterface) => {
        deleteItem.mutate(item.uuid, {
            onError: () => errorHaptic(),
            onSuccess: () => lightHaptic(),
        });
    };

    return (
        <div
            className="min-h-screen bg-primary px-4 pb-24"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
        >
            <div className="max-w-md mx-auto">
                <button
                    type="button"
                    onClick={() => { navigate("/ritual"); lightHaptic(); }}
                    className="text-text-secondary text-sm mb-2"
                >
                    ← Retour
                </button>
                <h1 className="text-2xl font-bold text-text-primary mb-2">
                    Liste de courses
                </h1>
                <p className="text-text-secondary text-sm mb-6">
                    Coche les articles achetés. Les récurrents reviendront tout seuls au jour choisi.
                </p>

                {list.isLoading && (
                    <p className="text-center text-text-secondary">Chargement...</p>
                )}

                {!list.isLoading && grouped.todo.length === 0 && grouped.done.length === 0 && (
                    <div className="bg-secondary border border-border-color rounded-2xl p-6 text-center">
                        <p className="text-text-secondary text-sm">
                            Aucun article. Ajoute ton premier produit.
                        </p>
                    </div>
                )}

                {grouped.todo.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                            À acheter ({grouped.todo.length})
                        </h2>
                        <ul className="flex flex-col gap-2">
                            {grouped.todo.map((item) => (
                                <ShoppingRow
                                    key={item.uuid}
                                    item={item}
                                    onToggle={() => toggle(item)}
                                    onDelete={() => remove(item)}
                                />
                            ))}
                        </ul>
                    </div>
                )}

                {grouped.done.length > 0 && (
                    <div>
                        <h2 className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                            Achetés ({grouped.done.length})
                        </h2>
                        <ul className="flex flex-col gap-2">
                            {grouped.done.map((item) => (
                                <ShoppingRow
                                    key={item.uuid}
                                    item={item}
                                    onToggle={() => toggle(item)}
                                    onDelete={() => remove(item)}
                                />
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <button
                type="button"
                onClick={() => { setShowAdd(true); lightHaptic(); }}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cout-yellow text-cout-purple font-bold text-2xl shadow-lg"
                style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
                aria-label="Ajouter un article"
            >
                +
            </button>

            {showAdd && (
                <AddItemModal onClose={() => setShowAdd(false)} />
            )}
        </div>
    );
}

function ShoppingRow({
    item,
    onToggle,
    onDelete,
}: {
    item: RitualShoppingItemInterface;
    onToggle: () => void;
    onDelete: () => void;
}) {
    return (
        <li className="bg-secondary border border-border-color rounded-xl p-3 flex items-center gap-3">
            <button
                type="button"
                onClick={onToggle}
                aria-label={item.checked ? "Décocher" : "Cocher"}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    item.checked
                        ? "bg-cout-yellow border-cout-yellow text-cout-purple"
                        : "border-border-color"
                }`}
            >
                {item.checked && <span className="text-xs font-bold">✓</span>}
            </button>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${item.checked ? "line-through text-text-secondary" : "text-text-primary"}`}>
                    {item.name}
                    {item.quantity && (
                        <span className="text-text-secondary font-normal ml-2">
                            {Number(item.quantity).toFixed(0)} {item.unit ?? ""}
                        </span>
                    )}
                </p>
                {item.recurrence !== "ONCE" && (
                    <p className="text-xs text-text-secondary mt-0.5">
                        {RECURRENCE_LABELS[item.recurrence]} · {DAY_OPTIONS.find(d => d.value === item.cycleDayOfWeek)?.label ?? ""}
                    </p>
                )}
            </div>
            <button
                type="button"
                onClick={onDelete}
                aria-label="Supprimer"
                className="text-text-secondary text-lg w-8 h-8 flex items-center justify-center"
            >
                ×
            </button>
        </li>
    );
}

function AddItemModal({ onClose }: { onClose: () => void }) {
    const create = useCreateShoppingItem();
    const [name, setName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("");
    const [recurrence, setRecurrence] = useState<ShoppingRecurrence>("ONCE");
    const [cycleDay, setCycleDay] = useState(6);

    const isValid = name.trim().length > 0;

    const submit = () => {
        if (!isValid) {
            errorHaptic();
            return;
        }
        create.mutate(
            {
                name: name.trim(),
                quantity: quantity ? Number(quantity) : undefined,
                unit: unit.trim() || undefined,
                recurrence,
                cycleDayOfWeek: cycleDay,
            },
            {
                onError: () => errorHaptic(),
                onSuccess: () => {
                    lightHaptic();
                    onClose();
                },
            },
        );
    };

    return (
        <Modal isOpen onClose={onClose} title="Ajouter un article" size="sm">
            <div className="p-6 flex flex-col gap-4">
                <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                        Article
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={SHOPPING_ITEM_NAME_MAX_LENGTH}
                        placeholder="ex: pain"
                        autoFocus
                        className="w-full px-4 py-3 bg-secondary border border-border-color rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-cout-yellow"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                            Quantité (optionnel)
                        </label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="1"
                            min={0}
                            className="w-full px-4 py-3 bg-secondary border border-border-color rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-cout-yellow"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                            Unité (optionnel)
                        </label>
                        <input
                            type="text"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            maxLength={SHOPPING_ITEM_UNIT_MAX_LENGTH}
                            placeholder="kg, L..."
                            className="w-full px-4 py-3 bg-secondary border border-border-color rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-cout-yellow"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                        Récurrence
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {(Object.keys(RECURRENCE_LABELS) as ShoppingRecurrence[]).map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => { setRecurrence(r); lightHaptic(); }}
                                className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                                    recurrence === r
                                        ? "bg-cout-yellow/20 border-2 border-cout-yellow text-text-primary"
                                        : "bg-secondary border border-border-color text-text-primary"
                                }`}
                            >
                                {RECURRENCE_LABELS[r]}
                            </button>
                        ))}
                    </div>
                </div>
                {recurrence !== "ONCE" && (
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                            Jour de cycle
                        </label>
                        <select
                            value={cycleDay}
                            onChange={(e) => setCycleDay(Number(e.target.value))}
                            className="w-full px-4 py-3 bg-secondary border border-border-color rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-cout-yellow"
                        >
                            {DAY_OPTIONS.map((d) => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>
                    </div>
                )}
                {create.isError && (
                    <p className="text-cancel-1 text-xs text-center">
                        {create.error?.message ?? "Erreur."}
                    </p>
                )}
                <button
                    type="button"
                    onClick={submit}
                    disabled={!isValid || create.isPending}
                    className="w-full px-5 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                >
                    {create.isPending ? "Ajout..." : "Ajouter"}
                </button>
            </div>
        </Modal>
    );
}
