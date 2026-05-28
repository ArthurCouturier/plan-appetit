import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryConfig";
import ShoppingListService from "../services/ShoppingListService";
import {
    ShoppingListInterface,
    ShoppingListItemInterface,
    ShoppingListSummaryInterface,
} from "../interfaces/shopping/ShoppingListInterface";
import { useActiveShoppingList } from "./useActiveShoppingList";
import { hasMirror } from "../offline/unsyncedShoppingLists";

function getAuthHeaders(): { email: string | null; token: string | null } {
    return {
        email: localStorage.getItem("email"),
        token: localStorage.getItem("firebaseIdToken"),
    };
}

export interface AddRecipeToShoppingListResult {
    listUuid: string;
    listName: string;
    listCreated: boolean;
    addedItems: ShoppingListItemInterface[];
}

export function useAddRecipeToShoppingList() {
    const qc = useQueryClient();
    const { activeUuid, setActiveUuid } = useActiveShoppingList();

    return useMutation<AddRecipeToShoppingListResult, Error, { recipeUuid: string }>({
        mutationFn: async ({ recipeUuid }) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");

            const cached = qc.getQueryData<ShoppingListSummaryInterface[]>(
                queryKeys.shoppingLists.all(),
            );
            const lists = cached ?? (await ShoppingListService.list(email, token));

            // Eligible = lists that aren't unsync (offline). Recipe→list requires API.
            const eligible = lists.filter((l) => !hasMirror(l.uuid));

            let listUuid = activeUuid && eligible.some((l) => l.uuid === activeUuid)
                ? activeUuid
                : eligible[0]?.uuid ?? null;
            let listName: string;
            let listCreated = false;

            if (!listUuid) {
                if (lists.length > 0 && eligible.length === 0) {
                    throw new Error("Toutes tes listes sont hors ligne. Resynchronise-en une d'abord.");
                }
                const created: ShoppingListInterface = await ShoppingListService.create(
                    email,
                    token,
                    {},
                );
                listUuid = created.uuid;
                listName = created.name;
                listCreated = true;
                setActiveUuid(created.uuid);
            } else {
                listName = eligible.find((l) => l.uuid === listUuid)?.name ?? "Liste";
            }

            const addedItems = await ShoppingListService.addFromRecipe(
                email,
                token,
                listUuid,
                recipeUuid,
            );
            return { listUuid, listName, listCreated, addedItems };
        },
        onSuccess: (result) => {
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.byId(result.listUuid) });
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}
