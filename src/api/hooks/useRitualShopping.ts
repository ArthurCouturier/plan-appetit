import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryConfig";
import RitualShoppingService from "../services/RitualShoppingService";
import {
    CreateShoppingItemRequest,
    RitualShoppingItemInterface,
    UpdateShoppingItemRequest,
} from "../interfaces/ritual/RitualShoppingInterface";
import useAuth from "./useAuth";

function getAuthHeaders(): { email: string | null; token: string | null } {
    return {
        email: localStorage.getItem("email"),
        token: localStorage.getItem("firebaseIdToken"),
    };
}

export function useRitualShoppingList() {
    const { user } = useAuth();
    return useQuery<RitualShoppingItemInterface[]>({
        queryKey: queryKeys.ritualShopping.all(),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return RitualShoppingService.list(email, token);
        },
        enabled: !!user,
        staleTime: 30 * 1000,
    });
}

export function useCreateShoppingItem() {
    const queryClient = useQueryClient();
    return useMutation<RitualShoppingItemInterface, Error, CreateShoppingItemRequest>({
        mutationFn: async (body) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return RitualShoppingService.create(email, token, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ritualShopping.all() });
        },
    });
}

export function useUpdateShoppingItem() {
    const queryClient = useQueryClient();
    return useMutation<
        RitualShoppingItemInterface,
        Error,
        { uuid: string; body: UpdateShoppingItemRequest }
    >({
        mutationFn: async ({ uuid, body }) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return RitualShoppingService.update(email, token, uuid, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ritualShopping.all() });
        },
    });
}

export function useDeleteShoppingItem() {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
        mutationFn: async (uuid) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return RitualShoppingService.remove(email, token, uuid);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.ritualShopping.all() });
        },
    });
}
