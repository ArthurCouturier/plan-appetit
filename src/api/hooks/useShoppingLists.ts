import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryConfig";
import ShoppingListService from "../services/ShoppingListService";
import {
    AddShoppingListMemberRequest,
    CreateShoppingListItemRequest,
    CreateShoppingListRequest,
    IngredientSuggestionInterface,
    ReconcileShoppingListRequest,
    ShoppingListInterface,
    ShoppingListItemInterface,
    ShoppingListSummaryInterface,
    UpdateShoppingListItemRequest,
    UpdateShoppingListRequest,
    SHOPPING_LIST_PERSONAL_ITEM_EMOJI,
} from "../interfaces/shopping/ShoppingListInterface";
import useAuth from "./useAuth";
import {
    NetworkError,
    isNetworkError,
    withNetworkErrorDetection,
} from "../offline/networkError";
import {
    applyAddItem,
    applyDeleteItem,
    applyRename,
    applyUpdateItem,
    deleteMirror,
    getAllMirrors,
    getMirror,
    mirrorToListInterface,
    mirrorToSummary,
    setMirror,
} from "../offline/unsyncedShoppingLists";
import {
    deleteCachedList,
    getCachedList,
    getCachedSummaries,
    setCachedList,
    setCachedSummaries,
    syncDetailsCacheWithSummaries,
} from "../offline/cachedShoppingLists";
import { useOfflineFallback } from "../../contexts/OfflineFallbackContext";

function getAuthHeaders(): { email: string | null; token: string | null } {
    return {
        email: localStorage.getItem("email"),
        token: localStorage.getItem("firebaseIdToken"),
    };
}

function newUuid(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function mergeSummariesPreferringMirrors(
    remote: ShoppingListSummaryInterface[],
    mirrors: ReturnType<typeof getAllMirrors>,
): ShoppingListSummaryInterface[] {
    if (mirrors.length === 0) return remote;
    const byUuid = new Map(remote.map((s) => [s.uuid, s]));
    for (const m of mirrors) {
        byUuid.set(m.sourceUuid, mirrorToSummary(m));
    }
    return Array.from(byUuid.values()).sort(
        (a, b) => b.updatedAt.localeCompare(a.updatedAt),
    );
}

export function useShoppingLists() {
    const { user } = useAuth();
    return useQuery<ShoppingListSummaryInterface[]>({
        queryKey: queryKeys.shoppingLists.all(),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            const mirrors = getAllMirrors();
            try {
                const remote = await withNetworkErrorDetection(() =>
                    ShoppingListService.list(email, token),
                );
                setCachedSummaries(remote);
                syncDetailsCacheWithSummaries(remote);
                return mergeSummariesPreferringMirrors(remote, mirrors);
            } catch (err) {
                if (isNetworkError(err)) {
                    const cached = getCachedSummaries() ?? [];
                    return mergeSummariesPreferringMirrors(cached, mirrors);
                }
                throw err;
            }
        },
        initialData: () => {
            const cached = getCachedSummaries();
            const mirrors = getAllMirrors();
            if (!cached && mirrors.length === 0) return undefined;
            return mergeSummariesPreferringMirrors(cached ?? [], mirrors);
        },
        initialDataUpdatedAt: 0,
        enabled: !!user,
        staleTime: 0,
        refetchOnMount: "always",
    });
}

export function useShoppingList(uuid: string | undefined) {
    const { user } = useAuth();
    return useQuery<ShoppingListInterface>({
        queryKey: queryKeys.shoppingLists.byId(uuid ?? ""),
        queryFn: async () => {
            if (!uuid) throw new Error("UUID manquant");
            const mirror = getMirror(uuid);
            if (mirror) return mirrorToListInterface(mirror);
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            try {
                const remote = await withNetworkErrorDetection(() =>
                    ShoppingListService.get(email, token, uuid),
                );
                setCachedList(remote);
                return remote;
            } catch (err) {
                if (isNetworkError(err)) {
                    const cached = getCachedList(uuid);
                    if (cached) return cached;
                }
                throw err;
            }
        },
        initialData: () => {
            if (!uuid) return undefined;
            const mirror = getMirror(uuid);
            if (mirror) return mirrorToListInterface(mirror);
            return getCachedList(uuid) ?? undefined;
        },
        initialDataUpdatedAt: 0,
        enabled: !!user && !!uuid,
        staleTime: 0,
        refetchOnMount: "always",
    });
}

/** Prefetch one list's full detail into React Query + localStorage cache. Used from the home page. */
export async function prefetchShoppingList(
    qc: ReturnType<typeof useQueryClient>,
    uuid: string,
): Promise<void> {
    if (getMirror(uuid)) return;
    const { email, token } = getAuthHeaders();
    if (!email || !token) return;
    try {
        await qc.prefetchQuery({
            queryKey: queryKeys.shoppingLists.byId(uuid),
            queryFn: async () => {
                const remote = await withNetworkErrorDetection(() =>
                    ShoppingListService.get(email, token, uuid),
                );
                setCachedList(remote);
                return remote;
            },
            staleTime: 30 * 1000,
        });
    } catch {
        // Silent — best-effort prefetch.
    }
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
    const { triggerOffline } = useOfflineFallback();
    return useMutation<ShoppingListInterface, Error, UpdateShoppingListRequest>({
        mutationFn: async (body) => {
            const mirror = getMirror(uuid);
            if (mirror) {
                const updated = applyRename(mirror, body.name?.trim() ?? mirror.name);
                setMirror(updated);
                return mirrorToListInterface(updated);
            }
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return withNetworkErrorDetection(() =>
                ShoppingListService.rename(email, token, uuid, body),
            );
        },
        onSuccess: (updated) => {
            qc.setQueryData(queryKeys.shoppingLists.byId(uuid), updated);
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
        onError: (err, body) => {
            if (err instanceof NetworkError) {
                triggerListNetworkFailure(qc, triggerOffline, uuid, () => {
                    const m = getMirror(uuid);
                    if (m && body.name) setMirror(applyRename(m, body.name.trim()));
                });
            }
        },
    });
}

export function useDeleteShoppingList() {
    const qc = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: async (listUuid) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.deleteList(email, token, listUuid);
        },
        onSuccess: (_void, listUuid) => {
            deleteMirror(listUuid);
            deleteCachedList(listUuid);
            qc.removeQueries({ queryKey: queryKeys.shoppingLists.byId(listUuid) });
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}

export function useAddShoppingItem(listUuid: string) {
    const qc = useQueryClient();
    const { triggerOffline } = useOfflineFallback();
    return useMutation<ShoppingListItemInterface, Error, CreateShoppingListItemRequest>({
        mutationFn: async (body) => {
            const mirror = getMirror(listUuid);
            if (mirror) {
                const item = synthesizeNewItem(body);
                setMirror(applyAddItem(mirror, item));
                return item;
            }
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return withNetworkErrorDetection(() =>
                ShoppingListService.addItem(email, token, listUuid, body),
            );
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.byId(listUuid) });
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
        onError: (err, body) => {
            if (err instanceof NetworkError) {
                triggerListNetworkFailure(qc, triggerOffline, listUuid, () => {
                    const m = getMirror(listUuid);
                    if (m) setMirror(applyAddItem(m, synthesizeNewItem(body)));
                });
            }
        },
    });
}

export function useUpdateShoppingItem(listUuid: string) {
    const qc = useQueryClient();
    const { triggerOffline } = useOfflineFallback();
    return useMutation<
        ShoppingListItemInterface,
        Error,
        { itemUuid: string; body: UpdateShoppingListItemRequest }
    >({
        mutationFn: async ({ itemUuid, body }) => {
            const mirror = getMirror(listUuid);
            if (mirror) {
                const updated = applyUpdateItem(mirror, itemUuid, body as Partial<ShoppingListItemInterface>);
                setMirror(updated);
                return updated.items.find((it) => it.uuid === itemUuid) ?? Promise.reject(new Error("Item introuvable"));
            }
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return withNetworkErrorDetection(() =>
                ShoppingListService.updateItem(email, token, listUuid, itemUuid, body),
            );
        },
        onMutate: async ({ itemUuid, body }) => {
            const key = queryKeys.shoppingLists.byId(listUuid);
            await qc.cancelQueries({ queryKey: key });
            const prev = qc.getQueryData<ShoppingListInterface>(key);
            if (prev) {
                qc.setQueryData<ShoppingListInterface>(key, {
                    ...prev,
                    items: prev.items.map((it) =>
                        it.uuid === itemUuid ? ({ ...it, ...body } as ShoppingListItemInterface) : it,
                    ),
                });
            }
            return { prev };
        },
        onError: (err, { itemUuid, body }, ctx) => {
            const prev = (ctx as { prev?: ShoppingListInterface } | undefined)?.prev;
            if (prev) qc.setQueryData(queryKeys.shoppingLists.byId(listUuid), prev);
            if (err instanceof NetworkError) {
                triggerListNetworkFailure(qc, triggerOffline, listUuid, () => {
                    const m = getMirror(listUuid);
                    if (m) setMirror(applyUpdateItem(m, itemUuid, body as Partial<ShoppingListItemInterface>));
                });
            }
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.byId(listUuid) });
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}

export function useDeleteShoppingItem(listUuid: string) {
    const qc = useQueryClient();
    const { triggerOffline } = useOfflineFallback();
    return useMutation<void, Error, string>({
        mutationFn: async (itemUuid) => {
            const mirror = getMirror(listUuid);
            if (mirror) {
                setMirror(applyDeleteItem(mirror, itemUuid));
                return;
            }
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return withNetworkErrorDetection(() =>
                ShoppingListService.deleteItem(email, token, listUuid, itemUuid),
            );
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.byId(listUuid) });
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
        onError: (err, itemUuid) => {
            if (err instanceof NetworkError) {
                triggerListNetworkFailure(qc, triggerOffline, listUuid, () => {
                    const m = getMirror(listUuid);
                    if (m) setMirror(applyDeleteItem(m, itemUuid));
                });
            }
        },
    });
}

export function useAddShoppingListMember(listUuid: string) {
    const qc = useQueryClient();
    return useMutation<ShoppingListInterface, Error, AddShoppingListMemberRequest>({
        mutationFn: async (body) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.addMember(email, token, listUuid, body);
        },
        onSuccess: (updated) => {
            qc.setQueryData(queryKeys.shoppingLists.byId(listUuid), updated);
            setCachedList(updated);
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}

export function useRemoveShoppingListMember(listUuid: string) {
    const qc = useQueryClient();
    return useMutation<ShoppingListInterface, Error, string>({
        mutationFn: async (targetUserUid) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.removeMember(email, token, listUuid, targetUserUid);
        },
        onSuccess: (updated) => {
            qc.setQueryData(queryKeys.shoppingLists.byId(listUuid), updated);
            setCachedList(updated);
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}

export function useLeaveShoppingList() {
    const qc = useQueryClient();
    return useMutation<ShoppingListInterface, Error, string>({
        mutationFn: async (listUuid) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.leaveList(email, token, listUuid);
        },
        onSuccess: (_updated, listUuid) => {
            // L'utilisateur n'a plus accès à la liste : on retire de la cache + mirror.
            deleteMirror(listUuid);
            deleteCachedList(listUuid);
            qc.removeQueries({ queryKey: queryKeys.shoppingLists.byId(listUuid) });
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}

export function useJoinShoppingListByInviteToken() {
    const qc = useQueryClient();
    return useMutation<ShoppingListInterface, Error, string>({
        mutationFn: async (inviteToken) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return ShoppingListService.joinByInviteToken(email, token, inviteToken);
        },
        onSuccess: (joined) => {
            setCachedList(joined);
            qc.setQueryData(queryKeys.shoppingLists.byId(joined.uuid), joined);
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}

export function useReconcileShoppingList(listUuid: string) {
    const qc = useQueryClient();
    return useMutation<ShoppingListInterface, Error, ReconcileShoppingListRequest>({
        mutationFn: async (body) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return withNetworkErrorDetection(() =>
                ShoppingListService.reconcile(email, token, listUuid, body),
            );
        },
        onSuccess: (reconciled) => {
            deleteMirror(listUuid);
            setCachedList(reconciled);
            qc.setQueryData(queryKeys.shoppingLists.byId(listUuid), reconciled);
            qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        },
    });
}

export function useIngredientSearch(query: string, enabledOverride = true) {
    const { user } = useAuth();
    const trimmed = query.trim();
    return useQuery<IngredientSuggestionInterface[]>({
        queryKey: queryKeys.ingredientSearch.byQuery(trimmed.toLowerCase()),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            try {
                return await withNetworkErrorDetection(() =>
                    ShoppingListService.searchIngredients(email, token, trimmed),
                );
            } catch (err) {
                if (isNetworkError(err)) return [];
                throw err;
            }
        },
        enabled: !!user && trimmed.length >= 2 && enabledOverride,
        staleTime: 5 * 60 * 1000,
    });
}

function synthesizeNewItem(body: CreateShoppingListItemRequest): ShoppingListItemInterface {
    const now = new Date().toISOString();
    return {
        uuid: newUuid(),
        ingredientUuid: body.ingredientUuid ?? null,
        ingredientName: null,
        emoji: SHOPPING_LIST_PERSONAL_ITEM_EMOJI,
        categoryCode: "OTHER",
        personalIngredientName: body.personalIngredientName ?? null,
        quantity: body.quantity ?? null,
        unitCode: body.unitCode ?? null,
        checked: false,
        updatedAt: now,
        updatedByUid: null,
    };
}

function triggerListNetworkFailure(
    qc: ReturnType<typeof useQueryClient>,
    triggerOffline: ReturnType<typeof useOfflineFallback>["triggerOffline"],
    listUuid: string,
    retryLocally: () => void,
) {
    const cached = qc.getQueryData<ShoppingListInterface>(
        queryKeys.shoppingLists.byId(listUuid),
    );
    triggerOffline({
        listUuid,
        listName: cached?.name ?? "cette liste",
        retryLocally,
    });
}
