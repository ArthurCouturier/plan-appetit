import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryConfig";
import ReferralService from "../services/ReferralService";
import {
    ApplyReferralResponseInterface,
    ReferralStatsInterface,
} from "../interfaces/referral/ReferralInterface";
import useAuth from "./useAuth";

function getAuthHeaders(): { email: string | null; token: string | null } {
    return {
        email: localStorage.getItem("email"),
        token: localStorage.getItem("firebaseIdToken"),
    };
}

export function useReferralStats() {
    const { user } = useAuth();
    return useQuery<ReferralStatsInterface>({
        queryKey: queryKeys.referral.stats(),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) {
                throw new Error("Non authentifié");
            }
            return ReferralService.getStats(email, token);
        },
        enabled: !!user,
        staleTime: 60 * 1000,
    });
}

export function useApplyReferralCode() {
    const queryClient = useQueryClient();
    return useMutation<ApplyReferralResponseInterface, Error, string>({
        mutationFn: async (code: string) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) {
                throw new Error("Non authentifié");
            }
            return ReferralService.applyCode(email, token, code);
        },
        onSuccess: (response) => {
            if (response.success) {
                queryClient.invalidateQueries({ queryKey: queryKeys.referral.stats() });
            }
        },
    });
}
