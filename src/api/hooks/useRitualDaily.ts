import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryConfig";
import RitualDailyService from "../services/RitualDailyService";
import {
    MealType,
    RegenerateRitualDailyRequest,
    RitualDailyInterface,
} from "../interfaces/ritual/RitualDailyInterface";
import useAuth from "./useAuth";

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

function getAuthHeaders(): { email: string | null; token: string | null } {
    return {
        email: localStorage.getItem("email"),
        token: localStorage.getItem("firebaseIdToken"),
    };
}

export function useRitualDaily(mealType: MealType, date?: string) {
    const { user } = useAuth();
    const effectiveDate = date ?? todayISO();
    return useQuery<RitualDailyInterface>({
        queryKey: queryKeys.ritualDaily.byMealAndDate(mealType, effectiveDate),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) {
                throw new Error("Non authentifié");
            }
            return RitualDailyService.getDaily(email, token, mealType, effectiveDate);
        },
        enabled: !!user,
        staleTime: 60 * 60 * 1000,
        retry: 0,
    });
}

export function useRegenerateRitualDaily() {
    const queryClient = useQueryClient();
    return useMutation<RitualDailyInterface, Error, RegenerateRitualDailyRequest>({
        mutationFn: async (body) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) {
                throw new Error("Non authentifié");
            }
            return RitualDailyService.regenerate(email, token, body);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(
                queryKeys.ritualDaily.byMealAndDate(data.mealType, data.date),
                data,
            );
            queryClient.invalidateQueries({ queryKey: ["ritualDaily"] });
        },
    });
}
