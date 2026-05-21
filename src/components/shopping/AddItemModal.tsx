import { useEffect, useMemo, useState } from "react";
import Modal from "../modals/Modal";
import {
    IngredientSuggestionInterface,
    SHOPPING_LIST_PERSONAL_NAME_MAX_LENGTH,
    SHOPPING_LIST_UNIT_CODE_MAX_LENGTH,
} from "../../api/interfaces/shopping/ShoppingListInterface";
import { useAddShoppingItem, useIngredientSearch } from "../../api/hooks/useShoppingLists";
import { unitLabelsV2 } from "../recipes-v2/recipeV2Labels";
import { lightHaptic } from "../../haptics/light";
import { errorHaptic } from "../../haptics/error";

function unitSymbol(code: string | null | undefined): string | null {
    if (!code) return null;
    const upper = code.toUpperCase();
    if (upper === "NONE") return null;
    return unitLabelsV2[upper]?.singular || code;
}

interface AddItemModalProps {
    listUuid: string;
    onClose: () => void;
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = window.setTimeout(() => setDebounced(value), delayMs);
        return () => window.clearTimeout(id);
    }, [value, delayMs]);
    return debounced;
}

export default function AddItemModal({ listUuid, onClose }: AddItemModalProps) {
    const [name, setName] = useState("");
    const [selected, setSelected] = useState<IngredientSuggestionInterface | null>(null);
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("");
    const addItem = useAddShoppingItem(listUuid);

    const debouncedQuery = useDebouncedValue(name, 250);
    const suggestions = useIngredientSearch(selected ? "" : debouncedQuery);

    const trimmed = name.trim();
    const canSubmit = useMemo(
        () => trimmed.length > 0 && !addItem.isPending,
        [trimmed, addItem.isPending],
    );

    useEffect(() => {
        if (selected && trimmed !== selected.name) {
            setSelected(null);
        }
    }, [trimmed, selected]);

    const submit = () => {
        if (!canSubmit) {
            errorHaptic();
            return;
        }
        const qty = quantity ? Number(quantity) : null;
        const unitCode = unit.trim() || (selected?.primaryUnitCode !== "NONE" ? selected?.primaryUnitCode ?? null : null);
        addItem.mutate(
            selected
                ? { ingredientUuid: selected.uuid, quantity: qty, unitCode }
                : { personalIngredientName: trimmed, quantity: qty, unitCode },
            {
                onSuccess: () => {
                    lightHaptic();
                    onClose();
                },
                onError: () => errorHaptic(),
            },
        );
    };

    const pickSuggestion = (s: IngredientSuggestionInterface) => {
        lightHaptic();
        setSelected(s);
        setName(s.name);
    };

    return (
        <Modal isOpen onClose={onClose} title="Ajouter un article" size="sm">
            <div className="p-6 flex flex-col gap-4">
                <div className="relative">
                    <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                        Article
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-secondary border border-border-color rounded-xl focus-within:ring-2 focus-within:ring-cout-yellow">
                        {selected && (
                            <span className="text-xl" aria-hidden>
                                {selected.emoji}
                            </span>
                        )}
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={SHOPPING_LIST_PERSONAL_NAME_MAX_LENGTH}
                            placeholder="ex: pain"
                            autoFocus
                            className="flex-1 bg-transparent text-text-primary placeholder-text-secondary outline-none min-w-0"
                        />
                    </div>

                    {!selected && trimmed.length >= 2 && suggestions.data && suggestions.data.length > 0 && (
                        <ul className="mt-2 max-h-48 overflow-y-auto bg-primary border border-border-color rounded-xl shadow-md">
                            {suggestions.data.map((s) => (
                                <li key={s.uuid}>
                                    <button
                                        type="button"
                                        onClick={() => pickSuggestion(s)}
                                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary transition-colors text-left"
                                    >
                                        <span className="text-xl">{s.emoji}</span>
                                        <span className="text-sm text-text-primary truncate">{s.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                            Quantité
                        </label>
                        <input
                            type="number"
                            inputMode="decimal"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="1"
                            min={0}
                            className="w-full px-4 py-3 bg-secondary border border-border-color rounded-xl text-text-primary placeholder-text-secondary outline-none focus:ring-2 focus:ring-cout-yellow"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                            Unité
                        </label>
                        <input
                            type="text"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            maxLength={SHOPPING_LIST_UNIT_CODE_MAX_LENGTH}
                            placeholder={unitSymbol(selected?.primaryUnitCode) ?? "g, mL..."}
                            className="w-full px-4 py-3 bg-secondary border border-border-color rounded-xl text-text-primary placeholder-text-secondary outline-none focus:ring-2 focus:ring-cout-yellow"
                        />
                    </div>
                </div>

                {addItem.isError && (
                    <p className="text-cancel-1 text-xs text-center">
                        {addItem.error?.message ?? "Erreur."}
                    </p>
                )}

                <button
                    type="button"
                    onClick={submit}
                    disabled={!canSubmit}
                    className="w-full px-5 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                >
                    {addItem.isPending ? "Ajout..." : "Ajouter"}
                </button>
            </div>
        </Modal>
    );
}
