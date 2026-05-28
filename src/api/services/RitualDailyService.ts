import {
    MealType,
    RegenerateRitualDailyRequest,
    RitualDailyInterface,
    RitualDailyServiceError,
    RitualInitialDayInterface,
} from "../interfaces/ritual/RitualDailyInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export default class RitualDailyService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        return this.port ? `${this.baseUrl}:${this.port}` : this.baseUrl;
    }

    private static baseEndpoint(): string {
        return `${this.getApiUrl()}/api/v1/ritual/daily`;
    }

    public static async getDaily(
        email: string,
        token: string,
        mealType: MealType,
        date?: string,
    ): Promise<RitualDailyInterface> {
        const params = new URLSearchParams({ mealType });
        if (date) params.set("date", date);
        const response = await fetchWithTokenRefresh(
            `${this.baseEndpoint()}?${params.toString()}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
            },
        );
        if (!response.ok) throw this.mapError(response.status);
        return response.json();
    }

    public static async getRange(
        email: string,
        token: string,
        from: string,
        to: string,
    ): Promise<RitualDailyInterface[]> {
        const params = new URLSearchParams({ from, to });
        const response = await fetchWithTokenRefresh(
            `${this.baseEndpoint()}/range?${params.toString()}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
            },
        );
        if (!response.ok) throw this.mapError(response.status);
        return response.json();
    }

    public static async generateInitialDay(
        email: string,
        token: string,
        date?: string,
    ): Promise<RitualInitialDayInterface> {
        const params = new URLSearchParams();
        if (date) params.set("date", date);
        const query = params.toString();
        const url = query
            ? `${this.baseEndpoint()}/initial-day?${query}`
            : `${this.baseEndpoint()}/initial-day`;
        const response = await fetchWithTokenRefresh(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Email: email,
            },
        });
        if (!response.ok) throw this.mapError(response.status);
        return response.json();
    }

    public static async regenerate(
        email: string,
        token: string,
        body: RegenerateRitualDailyRequest,
    ): Promise<RitualDailyInterface> {
        const response = await fetchWithTokenRefresh(`${this.baseEndpoint()}/regenerate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Email: email,
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) throw this.mapError(response.status);
        return response.json();
    }

    private static mapError(status: number): RitualDailyServiceError {
        switch (status) {
            case 401:
                return new RitualDailyServiceError("UNAUTHORIZED", "Non autorisé.");
            case 412:
                return new RitualDailyServiceError(
                    "PROFILE_MISSING",
                    "Termine ton onboarding ritual avant de générer une recette.",
                );
            case 402:
                return new RitualDailyServiceError(
                    "INSUFFICIENT_CREDITS",
                    "Crédits insuffisants pour régénérer la recette.",
                );
            default:
                return new RitualDailyServiceError("UNKNOWN", "Erreur inattendue.");
        }
    }
}
