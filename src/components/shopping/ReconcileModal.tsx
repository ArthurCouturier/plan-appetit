import { useMemo, useState } from "react";
import Modal from "../modals/Modal";
import {
    ReconcileShoppingListItem,
    ShoppingListInterface,
    ShoppingListItemInterface,
    shoppingListItemDisplayName,
} from "../../api/interfaces/shopping/ShoppingListInterface";
import {
    UnsyncedShoppingListMirror,
    computeDiff,
} from "../../api/offline/unsyncedShoppingLists";
import { useReconcileShoppingList } from "../../api/hooks/useShoppingLists";
import { formatQuantityV2 } from "../recipes-v2/recipeV2Labels";
import { lightHaptic } from "../../haptics/light";
import { errorHaptic } from "../../haptics/error";

interface ReconcileModalProps {
    mirror: UnsyncedShoppingListMirror;
    remote: ShoppingListInterface;
    onClose: () => void;
    onSuccess: () => void;
}

type ConflictSide = "local" | "remote";
type KeepDecision = "keep" | "discard";

function itemToReconcile(it: ShoppingListItemInterface): ReconcileShoppingListItem {
    return {
        uuid: it.uuid,
        ingredientUuid: it.ingredientUuid ?? null,
        personalIngredientName: it.personalIngredientName ?? null,
        quantity: it.quantity ?? null,
        unitCode: it.unitCode ?? null,
        checked: it.checked,
    };
}

function ItemSummaryLine({ item }: { item: ShoppingListItemInterface }) {
    const qty = item.quantity != null && item.quantity > 0
        ? formatQuantityV2(String(item.quantity), item.unitCode ?? "")
        : null;
    return (
        <div className="text-xs text-text-secondary">
            <span className="mr-1">{item.emoji}</span>
            <span className="text-text-primary font-medium">{shoppingListItemDisplayName(item)}</span>
            {qty && <span className="ml-2">{qty}</span>}
            {item.checked && <span className="ml-2 text-confirmation-1">✓</span>}
        </div>
    );
}

function KeepDiscardPicker({
    decision,
    onChange,
    keepLabel = "Garder",
    discardLabel = "Retirer",
    discardFirst = false,
}: {
    decision: KeepDecision;
    onChange: (d: KeepDecision) => void;
    keepLabel?: string;
    discardLabel?: string;
    discardFirst?: boolean;
}) {
    const keepBtn = (
        <button
            key="keep"
            type="button"
            onClick={() => { lightHaptic(); onChange("keep"); }}
            className={`px-2 py-1.5 rounded-lg border-2 text-xs font-semibold ${
                decision === "keep"
                    ? "border-cout-yellow bg-cout-yellow/10 text-text-primary"
                    : "border-border-color bg-primary text-text-secondary"
            }`}
        >
            {keepLabel}
        </button>
    );
    const discardBtn = (
        <button
            key="discard"
            type="button"
            onClick={() => { lightHaptic(); onChange("discard"); }}
            className={`px-2 py-1.5 rounded-lg border-2 text-xs font-semibold ${
                decision === "discard"
                    ? "border-cancel-1 bg-cancel-1/10 text-text-primary"
                    : "border-border-color bg-primary text-text-secondary"
            }`}
        >
            {discardLabel}
        </button>
    );
    return (
        <div className="mt-2 grid grid-cols-2 gap-2">
            {discardFirst ? [discardBtn, keepBtn] : [keepBtn, discardBtn]}
        </div>
    );
}

export default function ReconcileModal({
    mirror,
    remote,
    onClose,
    onSuccess,
}: ReconcileModalProps) {
    const diff = useMemo(() => computeDiff(mirror, remote), [mirror, remote]);
    // Online-priority defaults : conflits + suppressions locales défavorisent le local,
    // les ajouts seul-côté sont conservés par défaut (rien à arbitrer).
    const [nameSide, setNameSide] = useState<ConflictSide>("remote");
    const [itemSides, setItemSides] = useState<Record<string, ConflictSide>>(() =>
        Object.fromEntries(diff.itemConflicts.map((c) => [c.uuid, "remote" as ConflictSide])),
    );
    const [localOnlyDecisions, setLocalOnlyDecisions] = useState<Record<string, KeepDecision>>(() =>
        Object.fromEntries(diff.localOnly.map((it) => [it.uuid, "keep" as KeepDecision])),
    );
    const [remoteOnlyDecisions, setRemoteOnlyDecisions] = useState<Record<string, KeepDecision>>(() =>
        Object.fromEntries(diff.remoteOnly.map((it) => [it.uuid, "keep" as KeepDecision])),
    );
    const [localDeletedDecisions, setLocalDeletedDecisions] = useState<Record<string, KeepDecision>>(() =>
        Object.fromEntries(diff.localDeleted.map((it) => [it.uuid, "keep" as KeepDecision])),
    );
    const reconcile = useReconcileShoppingList(mirror.sourceUuid);

    const nothingToDo =
        !diff.nameConflict
        && diff.itemConflicts.length === 0
        && diff.localOnly.length === 0
        && diff.remoteOnly.length === 0
        && diff.localDeleted.length === 0;

    const submit = () => {
        lightHaptic();
        const finalName = diff.nameConflict
            ? (nameSide === "remote" ? diff.nameConflict.remote : diff.nameConflict.local)
            : mirror.name;
        const finalItems: ReconcileShoppingListItem[] = [
            ...diff.unchanged.map(itemToReconcile),
            ...diff.itemConflicts.map((c) =>
                itemToReconcile(itemSides[c.uuid] === "remote" ? c.remote : c.local),
            ),
            ...diff.localOnly
                .filter((it) => localOnlyDecisions[it.uuid] === "keep")
                .map(itemToReconcile),
            ...diff.remoteOnly
                .filter((it) => remoteOnlyDecisions[it.uuid] === "keep")
                .map(itemToReconcile),
            ...diff.localDeleted
                .filter((it) => localDeletedDecisions[it.uuid] === "keep")
                .map(itemToReconcile),
        ];
        reconcile.mutate(
            { name: finalName, items: finalItems },
            {
                onSuccess: () => {
                    lightHaptic();
                    onSuccess();
                },
                onError: () => errorHaptic(),
            },
        );
    };

    return (
        <Modal isOpen onClose={onClose} title="Resynchroniser" size="md">
            <div className="p-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">
                {nothingToDo && (
                    <p className="text-sm text-text-secondary">
                        Local et serveur sont identiques, rien à synchroniser.
                    </p>
                )}

                {diff.nameConflict && (
                    <section>
                        <h3 className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                            Nom de la liste
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => { lightHaptic(); setNameSide("local"); }}
                                className={`px-3 py-2 rounded-xl text-sm font-medium border-2 text-left ${
                                    nameSide === "local"
                                        ? "border-cout-yellow bg-cout-yellow/10 text-text-primary"
                                        : "border-border-color bg-secondary text-text-secondary"
                                }`}
                            >
                                <div className="text-[10px] uppercase mb-0.5">Local</div>
                                {diff.nameConflict.local}
                            </button>
                            <button
                                type="button"
                                onClick={() => { lightHaptic(); setNameSide("remote"); }}
                                className={`px-3 py-2 rounded-xl text-sm font-medium border-2 text-left ${
                                    nameSide === "remote"
                                        ? "border-cout-yellow bg-cout-yellow/10 text-text-primary"
                                        : "border-border-color bg-secondary text-text-secondary"
                                }`}
                            >
                                <div className="text-[10px] uppercase mb-0.5">Serveur</div>
                                {diff.nameConflict.remote}
                            </button>
                        </div>
                    </section>
                )}

                {diff.itemConflicts.length > 0 && (
                    <section>
                        <h3 className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                            Conflits ({diff.itemConflicts.length})
                        </h3>
                        <ul className="flex flex-col gap-3">
                            {diff.itemConflicts.map((c) => (
                                <li key={c.uuid} className="bg-secondary border border-border-color rounded-xl p-3">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                lightHaptic();
                                                setItemSides((s) => ({ ...s, [c.uuid]: "local" }));
                                            }}
                                            className={`px-2 py-2 rounded-lg border-2 text-left ${
                                                itemSides[c.uuid] === "local"
                                                    ? "border-cout-yellow bg-cout-yellow/10"
                                                    : "border-border-color bg-primary"
                                            }`}
                                        >
                                            <div className="text-[10px] uppercase mb-0.5 text-text-secondary">Local</div>
                                            <ItemSummaryLine item={c.local} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                lightHaptic();
                                                setItemSides((s) => ({ ...s, [c.uuid]: "remote" }));
                                            }}
                                            className={`px-2 py-2 rounded-lg border-2 text-left ${
                                                itemSides[c.uuid] === "remote"
                                                    ? "border-cout-yellow bg-cout-yellow/10"
                                                    : "border-border-color bg-primary"
                                            }`}
                                        >
                                            <div className="text-[10px] uppercase mb-0.5 text-text-secondary">Serveur</div>
                                            <ItemSummaryLine item={c.remote} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {diff.localOnly.length > 0 && (
                    <section>
                        <h3 className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                            Ajoutés en local ({diff.localOnly.length})
                        </h3>
                        <ul className="flex flex-col gap-2">
                            {diff.localOnly.map((it) => (
                                <li key={it.uuid} className="bg-secondary border border-border-color rounded-xl p-3">
                                    <ItemSummaryLine item={it} />
                                    <KeepDiscardPicker
                                        decision={localOnlyDecisions[it.uuid]}
                                        onChange={(d) => setLocalOnlyDecisions((s) => ({ ...s, [it.uuid]: d }))}
                                        keepLabel="Ajouter au serveur"
                                        discardLabel="Ne pas ajouter"
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {diff.remoteOnly.length > 0 && (
                    <section>
                        <h3 className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                            Ajoutés côté serveur ({diff.remoteOnly.length})
                        </h3>
                        <ul className="flex flex-col gap-2">
                            {diff.remoteOnly.map((it) => (
                                <li key={it.uuid} className="bg-secondary border border-border-color rounded-xl p-3">
                                    <ItemSummaryLine item={it} />
                                    <KeepDiscardPicker
                                        decision={remoteOnlyDecisions[it.uuid]}
                                        onChange={(d) => setRemoteOnlyDecisions((s) => ({ ...s, [it.uuid]: d }))}
                                        keepLabel="Garder"
                                        discardLabel="Retirer"
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {diff.localDeleted.length > 0 && (
                    <section>
                        <h3 className="text-xs uppercase tracking-wider text-text-secondary mb-2">
                            Supprimés en local ({diff.localDeleted.length})
                        </h3>
                        <ul className="flex flex-col gap-2">
                            {diff.localDeleted.map((it) => (
                                <li key={it.uuid} className="bg-secondary border border-border-color rounded-xl p-3">
                                    <ItemSummaryLine item={it} />
                                    <KeepDiscardPicker
                                        decision={localDeletedDecisions[it.uuid]}
                                        onChange={(d) => setLocalDeletedDecisions((s) => ({ ...s, [it.uuid]: d }))}
                                        keepLabel="Restaurer"
                                        discardLabel="Confirmer la suppression"
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {reconcile.isError && (
                    <p className="text-cancel-1 text-xs text-center">
                        {reconcile.error?.message ?? "Erreur lors de la synchronisation."}
                    </p>
                )}

                <div className="flex flex-col gap-2 pt-2">
                    <button
                        type="button"
                        onClick={submit}
                        disabled={reconcile.isPending}
                        className="w-full px-5 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                    >
                        {reconcile.isPending ? "Synchronisation..." : "Appliquer"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={reconcile.isPending}
                        className="w-full px-5 py-3 rounded-full bg-secondary border border-border-color text-text-primary font-semibold disabled:opacity-50"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </Modal>
    );
}
