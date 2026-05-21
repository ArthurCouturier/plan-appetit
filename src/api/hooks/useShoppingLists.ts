import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryConfig";
import ShoppingListService from "../services/ShoppingListService";
import {
    CreateShoppingListItemRequest,
    CreateShoppingListRequest,
    IngredientSuggestionInterface,
    ShoppingListInterface,
    ShoppingListItemInterface,
    ShoppingListSummaryInterface,
    UpdateShoppingListItemRequest,
    UpdateShoppingListRequest,
} from "../interfaces/shopping/ShoppingListInterface";
import useAuth from "./useAuth";

function getAuthHeaders(): { email: string | null; token: string | null } {
    return {
        email: localStorage.getItem("email"),
        token: localStorage.getItem("firebaseIdToken"),
    };
}

export function useShoppingLists() {
    const { user } = useAuth();
    return useQuery<ShoppingListSummaryInterface[]>({
        queryKey: queryKeys.shoppingLists.all(),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.list(email, token);
        },
        enabled: !!user,
        staleTime: 60 * 1000,
    });
}

export function useShoppingList(uuid: string | undefined) {
    const { user } = useAuth();
    return useQuery<ShoppingListInterface>({
        queryKey: queryKeys.shoppingLists.byId(uuid ?? ""),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            if (!uuid) throw new Error("UUID manquant");
            return ShoppingListService.get(email, token, uuid);
        },
        enabled: !!user && !!uuid,
        staleTime: 30 * 1000,
    });
}

export function useCreateShoppingList() {
    const qc = useQueryClient();
    return useMutation<ShoppingListInterface, Error, CreateShoppingListRequest>({
        mutationFn: async (body) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.create(email, token, body);
        },
        onSuccess: (created) => {
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
            qc.setQueryData(queryKeys.shoppingLists.byId(created.uuid), created);
        },
    });
}

export function useRenameShoppingList(uuid: string) {
    const qc = useQueryClient();
    return useMutation<ShoppingListInterface, Error, UpdateShoppingListRequest>({
        mutationFn: async (body) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.rename(email, token, uuid, body);
        },
        onSuccess: (updated) => {
            qc.setQueryData(queryKeys.shoppingLists.byId(uuid), updated);
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}

export function useDeleteShoppingList() {
    const qc = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: async (uuid) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.deleteList(email, token, uuid);
        },
        onSuccess: (_void, uuid) => {
            qc.removeQueries({ queryKey: queryKeys.shoppingLists.byId(uuid) });
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}

export function useAddShoppingItem(listUuid: string) {
    const qc = useQueryClient();
    return useMutation<ShoppingListItemInterface, Error, CreateShoppingListItemRequest>({
        mutationFn: async (body) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.addItem(email, token, listUuid, body);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.byId(listUuid) });
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}

export function useUpdateShoppingItem(listUuid: string) {
    const qc = useQueryClient();
    return useMutation<
        ShoppingListItemInterface,
        Error,
        { itemUuid: string; body: UpdateShoppingListItemRequest }
    >({
        mutationFn: async ({ itemUuid, body }) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.updateItem(email, token, listUuid, itemUuid, body);
        },
        onMutate: async ({ itemUuid, body }) => {
            const key = queryKeys.shoppingLists.byId(listUuid);
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<ShoppingListInterface>(key);
            if (prev) {
                qc.setQueryData<ShoppingListInterface>(key, {
                    ...prev,
                    items: prev.items.map((it) =>
                        it.uuid === itemUuid ? { ...it, ...body } as ShoppingListItemInterface : it,
                    ),
                });
            }
            return { prev };
        },
        onError: (_err, _vars, ctx) => {
            const prev = (ctx as { prev?: ShoppingListInterface } | undefined)?.prev;
            if (prev) qc.setQueryData(queryKeys.shoppingLists.byId(listUuid), prev);
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.byId(listUuid) });
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}

export function useDeleteShoppingItem(listUuid: string) {
    const qc = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: async (itemUuid) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.deleteItem(email, token, listUuid, itemUuid);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.byId(listUuid) });
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}

export function useIngredientSearch(query: string) {
    const { user } = useAuth();
    const trimmed = query.trim();
    return useQuery<IngredientSuggestionInterface[]>({
        queryKey: queryKeys.ingredientSearch.byQuery(trimmed.toLowerCase()),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.searchIngredients(email, token, trimmed);
        },
        enabled: !!user && trimmed.length >= 2,
        staleTime: 5 * 60 * 1000,
    });
}
