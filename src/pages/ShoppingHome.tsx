import { PlusIcon } from "@heroicons/react/24/solid";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useActiveShoppingList } from "../api/hooks/useActiveShoppingList";
import {
    prefetchShoppingList,
    useCreateShoppingList,
    useShoppingLists,
} from "../api/hooks/useShoppingLists";
import { useAllUnsyncedMirrors } from "../api/hooks/useUnsyncedShoppingList";
import { ShoppingListLimitReachedError } from "../api/services/ShoppingListService";
import ShoppingListCard from "../components/shopping/ShoppingListCard";
import { lightHaptic } from "../haptics/light";
import { errorHaptic } from "../haptics/error";

export default function ShoppingHome() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { data: lists, isLoading, isError, refetch } = useShoppingLists();
    const createList = useCreateShoppingList();
    const { activeUuid } = useActiveShoppingList();
    const mirrors = useAllUnsyncedMirrors();
    const offlineUuids = useMemo(
        () => new Set(mirrors.map((m) => m.sourceUuid)),
        [mirrors],
    );
    const [limitError, setLimitError] = useState<string | null>(null);

    useEffect(() => {
        if (!lists || lists.length === 0) return;
        for (const summary of lists) {
            void prefetchShoppingList(qc, summary.uuid);
        }
    }, [lists, qc]);

    useEffect(() => {
        if (!limitError) return;
        const id = window.setTimeout(() => setLimitError(null), 5000);
        return () => window.clearTimeout(id);
    }, [limitError]);

    const handleCreate = () => {
        lightHaptic();
        setLimitError(null);
        createList.mutate(
            {},
            {
                onSuccess: (created) => navigate(`/shopping/${created.uuid}`),
                onError: (err) => {
                    errorHaptic();
                    if (err instanceof ShoppingListLimitReachedError) {
                        setLimitError(
                            `Limite de ${err.limit} listes atteinte. Supprime-en une pour en créer une nouvelle.`,
                        );
                    }
                },
            },
        );
    };

    return (
        <div className="min-h-screen bg-bg-color px-4 pb-24 mobile-content-with-header">
            <div className="max-w-md mx-auto pt-4">
                <h1 className="text-2xl font-bold text-text-primary mb-4">
                    Mes listes
                </h1>

                {isLoading && (
                    <p className="text-text-secondary text-sm">Chargement...</p>
                )}

                {isError && (
                    <div className="flex flex-col items-center gap-3 mt-8">
                        <p className="text-text-secondary text-sm">Erreur lors du chargement.</p>
                        <button
                            type="button"
                            onClick={() => refetch()}
                            className="px-4 py-2 rounded-full bg-cout-purple text-white font-semibold text-sm"
                        >
                            Réessayer
                        </button>
                    </div>
                )}

                {!isLoading && !isError && lists && lists.length === 0 && (
                    <div className="bg-secondary border border-border-color rounded-2xl p-6 text-center mt-4">
                        <p className="text-text-secondary text-sm mb-4">
                            Aucune liste pour le moment.
                        </p>
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={createList.isPending}
                            className="px-5 py-2.5 rounded-full bg-cout-yellow text-cout-purple font-bold text-sm disabled:opacity-50"
                        >
                            Créer ma première liste
                        </button>
                    </div>
                )}

                {lists && lists.length > 0 && (
                    <ul className="flex flex-col gap-3">
                        {lists.map((list) => (
                            <li key={list.uuid}>
                                <ShoppingListCard
                                    list={list}
                                    isActive={activeUuid === list.uuid}
                                    isOffline={offlineUuids.has(list.uuid)}
                                    onClick={() => {
                                        lightHaptic();
                                        navigate(`/shopping/${list.uuid}`);
                                    }}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {limitError && (
                <div
                    className="fixed left-4 right-4 max-w-md mx-auto px-4 py-3 rounded-xl bg-cancel-1 text-white text-sm font-medium shadow-lg text-center"
                    style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 6rem)" }}
                    role="alert"
                >
                    {limitError}
                </div>
            )}

            <button
                type="button"
                onClick={handleCreate}
                disabled={createList.isPending}
                aria-label="Nouvelle liste"
                className={`fixed right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 transition-colors ${
                    limitError
                        ? "bg-cancel-1 text-white"
                        : "bg-cout-yellow text-cout-purple"
                }`}
                style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
            >
                <PlusIcon className="w-7 h-7" />
            </button>
        </div>
    );
}
