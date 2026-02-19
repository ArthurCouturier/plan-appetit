import BackendService from "./BackendService";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export interface TriggerDailyRecipesResponse {
    status: string;
    recipesGenerated?: number;
    recipes?: { uuid: string; name: string }[];
    message?: string;
}

export interface SetRoleResponse {
    status: string;
    email: string;
    role: string;
    message?: string;
}

export default class AdminService {

    static async triggerDailyRecipes(): Promise<TriggerDailyRecipesResponse> {
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("firebaseIdToken");

        if (!email || !token) {
            throw new Error("Not authenticated");
        }

        const response = await fetchWithTokenRefresh(
            `${BackendService.baseUrl}:${BackendService.port}/api/v1/admin/trigger-daily-recipes`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
            }
        );

        if (response.status === 403) {
            throw new Error("Forbidden");
        }

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.message || `Error ${response.status}`);
        }

        return response.json();
    }

    static async setUserPremium(targetEmail: string): Promise<SetRoleResponse> {
        return this.setUserRole("set-premium", targetEmail);
    }

    static async setUserMember(targetEmail: string): Promise<SetRoleResponse> {
        return this.setUserRole("set-member", targetEmail);
    }

    private static async setUserRole(endpoint: string, targetEmail: string): Promise<SetRoleResponse> {
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("firebaseIdToken");

        if (!email || !token) {
            throw new Error("Not authenticated");
        }

        const response = await fetchWithTokenRefresh(
            `${BackendService.baseUrl}:${BackendService.port}/api/v1/admin/${endpoint}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
                body: JSON.stringify({ email: targetEmail }),
            }
        );

        if (response.status === 403) {
            throw new Error("Forbidden");
        }

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.message || `Error ${response.status}`);
        }

        return response.json();
    }
}
