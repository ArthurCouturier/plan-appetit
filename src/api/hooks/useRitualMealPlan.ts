import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryConfig";
import RitualMealPlanService from "../services/RitualMealPlanService";
import {
    RitualMealPlanEntryInterface,
    RitualMealPlanWeekInterface,
    UpsertMealPlanEntryRequest,
} from "../interfaces/ritual/RitualMealPlanInterface";
import { MealType } from "../interfaces/ritual/RitualDailyInterface";
import useAuth from "./useAuth";

function getAuthHeaders(): { email: string | null; token: string | null } {
    return {
        email: localStorage.getItem("email"),
        token: localStorage.getItem("firebaseIdToken"),
    };
}

export function useRitualMealPlanWeek(from: string, to: string) {
    const { user } = useAuth();
    return useQuery<RitualMealPlanWeekInterface>({
        queryKey: queryKeys.ritualMealPlan.week(from, to),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return RitualMealPlanService.getWeek(email, token, from, to);
        },
        enabled: !!user,
        staleTime: 60 * 1000,
    });
}

export function useUpsertMealPlanEntry(weekFrom: string, weekTo: string) {
    const queryClient = useQueryClient();
    return useMutation<RitualMealPlanEntryInterface, Error, UpsertMealPlanEntryRequest>({
        mutationFn: async (body) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return RitualMealPlanService.upsert(email, token, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.ritualMealPlan.week(weekFrom, weekTo),
            });
        },
    });
}

export function useDeleteMealPlanEntry(weekFrom: string, weekTo: string) {
    const queryClient = useQueryClient();
    return useMutation<void, Error, { date: string; mealType: MealType }>({
        mutationFn: async ({ date, mealType }) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) throw new Error("Non authentifié");
            return RitualMealPlanService.deleteEntry(email, token, date, mealType);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.ritualMealPlan.week(weekFrom, weekTo),
            });
        },
    });
}
