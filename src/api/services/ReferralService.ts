import {
    ApplyReferralResponseInterface,
    ReferralStatsInterface,
} from "../interfaces/referral/ReferralInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export default class ReferralService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        return this.port ? `${this.baseUrl}:${this.port}` : this.baseUrl;
    }

    public static async getStats(
        email: string,
        token: string,
    ): Promise<ReferralStatsInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/referrals/me`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
            },
        );
        if (!response.ok) {
            throw new Error("Erreur lors de la récupération du parrainage.");
        }
        return response.json();
    }

    public static async applyCode(
        email: string,
        token: string,
        code: string,
    ): Promise<ApplyReferralResponseInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/referrals/apply`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
                body: JSON.stringify({ code }),
            },
        );
        return response.json();
    }
}
