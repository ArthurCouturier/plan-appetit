import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryConfig";
import RitualDailyService from "../services/RitualDailyService";
import {
    MealType,
    RegenerateRitualDailyRequest,
    RitualDailyInterface,
    RitualInitialDayInterface,
} from "../interfaces/ritual/RitualDailyInterface";
import useAuth from "./useAuth";
import { localIsoDate } from "../../utils/dateUtils";

function getAuthHeaders(): { email: string | null; token: string | null } {
    return {
        email: localStorage.getItem("email"),
        token: localStorage.getItem("firebaseIdToken"),
    };
}

export function useRitualDaily(mealType: MealType, date?: string, enabled: boolean = true) {
    const { user } = useAuth();
    const effectiveDate = date ?? localIsoDate();
    return useQuery<RitualDailyInterface>({
        queryKey: queryKeys.ritualDaily.byMealAndDate(mealType, effectiveDate),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) {
                throw new Error("Non authentifié");
            }
            return RitualDailyService.getDaily(email, token, mealType, effectiveDate);
        },
        enabled: !!user && enabled,
        staleTime: 60 * 60 * 1000,
        retry: 0,
    });
}

export function useRitualDailyRange(from: string, to: string) {
    const { user } = useAuth();
    return useQuery<RitualDailyInterface[]>({
        queryKey: queryKeys.ritualDaily.range(from, to),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) {
                throw new Error("Non authentifié");
            }
            return RitualDailyService.getRange(email, token, from, to);
        },
        enabled: !!user,
        staleTime: 60 * 1000,
        retry: 0,
    });
}

export function useRitualDailyBootstrap(date?: string) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const effectiveDate = date ?? localIsoDate();
    const triggeredRef = useRef(false);

    const rangeQuery = useQuery<RitualDailyInterface[]>({
        queryKey: queryKeys.ritualDaily.range(effectiveDate, effectiveDate),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) {
                throw new Error("Non authentifié");
            }
            return RitualDailyService.getRange(email, token, effectiveDate, effectiveDate);
        },
        enabled: !!user,
        staleTime: 60 * 1000,
        retry: 0,
    });

    const initialDayMutation = useMutation<RitualInitialDayInterface, Error, void>({
        mutationFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) {
                throw new Error("Non authentifié");
            }
            return RitualDailyService.generateInitialDay(email, token, effectiveDate);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(
                queryKeys.ritualDaily.byMealAndDate(data.lunch.mealType, data.lunch.date),
                data.lunch,
            );
            queryClient.setQueryData(
                queryKeys.ritualDaily.byMealAndDate(data.dinner.mealType, data.dinner.date),
                data.dinner,
            );
            queryClient.invalidateQueries({ queryKey: ["ritualDaily"] });
        },
    });

    const assignments = rangeQuery.data;
    const isEmptyDay = assignments !== undefined && assignments.length === 0;

    useEffect(() => {
        if (!isEmptyDay) return;
        if (triggeredRef.current) return;
        if (initialDayMutation.isPending) return;
        triggeredRef.current = true;
        initialDayMutation.mutate();
    }, [isEmptyDay, initialDayMutation]);

    const ready =
        rangeQuery.isSuccess &&
        ((assignments?.length ?? 0) > 0 || initialDayMutation.isSuccess);

    return {
        ready,
        isLoading: rangeQuery.isLoading || initialDayMutation.isPending,
        error: rangeQuery.error ?? initialDayMutation.error ?? null,
        retry: () => {
            if (rangeQuery.isError) {
                rangeQuery.refetch();
                return;
            }
            if (initialDayMutation.isError) {
                triggeredRef.current = false;
                initialDayMutation.reset();
                if (isEmptyDay) {
                    triggeredRef.current = true;
                    initialDayMutation.mutate();
                }
            }
        },
    };
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
