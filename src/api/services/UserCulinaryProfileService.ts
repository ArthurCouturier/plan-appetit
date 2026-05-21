import {
    UpdateUserCulinaryProfileRequest,
    UserCulinaryProfileInterface,
} from "../interfaces/users/UserCulinaryProfileInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export default class UserCulinaryProfileService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        return this.port ? `${this.baseUrl}:${this.port}` : this.baseUrl;
    }

    private static baseEndpoint(): string {
        return `${this.getApiUrl()}/api/v1/users/me/culinary-profile`;
    }

    public static async getMyCulinaryProfile(
        email: string,
        token: string,
    ): Promise<UserCulinaryProfileInterface> {
        const response = await fetchWithTokenRefresh(this.baseEndpoint(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Email: email,
            },
        });
        if (!response.ok) throw new Error("Erreur lors de la récupération du profil culinaire.");
        return response.json();
    }

    public static async updateMyCulinaryProfile(
        email: string,
        token: string,
        body: UpdateUserCulinaryProfileRequest,
    ): Promise<UserCulinaryProfileInterface> {
        const response = await fetchWithTokenRefresh(this.baseEndpoint(), {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Email: email,
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Erreur lors de la mise à jour du profil culinaire.");
        return response.json();
    }

    public static async completeOnboarding(
        email: string,
        token: string,
    ): Promise<UserCulinaryProfileInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.baseEndpoint()}/complete-onboarding`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
            },
        );
        if (!response.ok) {
            if (response.status === 400) {
                throw new Error("Les restrictions alimentaires/allergies doivent être renseignées.");
            }
            throw new Error("Erreur lors de la validation de l'onboarding.");
        }
        return response.json();
    }
}
