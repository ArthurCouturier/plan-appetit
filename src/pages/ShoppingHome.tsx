import { PlusIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { useActiveShoppingList } from "../api/hooks/useActiveShoppingList";
import { useCreateShoppingList, useShoppingLists } from "../api/hooks/useShoppingLists";
import ShoppingListCard from "../components/shopping/ShoppingListCard";
import { lightHaptic } from "../haptics/light";
import { errorHaptic } from "../haptics/error";

export default function ShoppingHome() {
    const navigate = useNavigate();
    const { data: lists, isLoading, isError, refetch } = useShoppingLists();
    const createList = useCreateShoppingList();
    const { activeUuid } = useActiveShoppingList();

    const handleCreate = () => {
        lightHaptic();
        createList.mutate(
            {},
            {
                onSuccess: (created) => navigate(`/shopping/${created.uuid}`),
                onError: () => errorHaptic(),
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

            <button
                type="button"
                onClick={handleCreate}
                disabled={createList.isPending}
                aria-label="Nouvelle liste"
                className="fixed right-6 w-14 h-14 rounded-full bg-cout-yellow text-cout-purple shadow-lg flex items-center justify-center disabled:opacity-50"
                style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1.5rem)" }}
            >
                <PlusIcon className="w-7 h-7" />
            </button>
        </div>
    );
}
