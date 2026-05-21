import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryConfig";
import UserCulinaryProfileService from "../services/UserCulinaryProfileService";
import {
    UpdateUserCulinaryProfileRequest,
    UserCulinaryProfileInterface,
} from "../interfaces/users/UserCulinaryProfileInterface";
import useAuth from "./useAuth";

function getAuthHeaders(): { email: string | null; token: string | null } {
    return {
        email: localStorage.getItem("email"),
        token: localStorage.getItem("firebaseIdToken"),
    };
}

export function useCulinaryProfile() {
    const { user } = useAuth();
    return useQuery<UserCulinaryProfileInterface>({
        queryKey: queryKeys.culinaryProfile.me(),
        queryFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) {
                throw new Error("Non authentifié");
            }
            return UserCulinaryProfileService.getMyCulinaryProfile(email, token);
        },
        enabled: !!user,
        staleTime: 5 * 60 * 1000,
    });
}

export function useUpdateCulinaryProfile() {
    const queryClient = useQueryClient();
    return useMutation<UserCulinaryProfileInterface, Error, UpdateUserCulinaryProfileRequest>({
        mutationFn: async (body) => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) {
                throw new Error("Non authentifié");
            }
            return UserCulinaryProfileService.updateMyCulinaryProfile(email, token, body);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(queryKeys.culinaryProfile.me(), data);
        },
    });
}

export function useCompleteCulinaryOnboarding() {
    const queryClient = useQueryClient();
    return useMutation<UserCulinaryProfileInterface, Error, void>({
        mutationFn: async () => {
            const { email, token } = getAuthHeaders();
            if (!email || !token) {
                throw new Error("Non authentifié");
            }
            return UserCulinaryProfileService.completeOnboarding(email, token);
        },
        onSuccess: (data) => {
            queryClient.setQueryData(queryKeys.culinaryProfile.me(), data);
        },
    });
}
