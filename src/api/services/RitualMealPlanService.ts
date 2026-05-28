import {
    RitualMealPlanEntryInterface,
    RitualMealPlanWeekInterface,
    UpsertMealPlanEntryRequest,
} from "../interfaces/ritual/RitualMealPlanInterface";
import { MealType } from "../interfaces/ritual/RitualDailyInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export default class RitualMealPlanService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        return this.port ? `${this.baseUrl}:${this.port}` : this.baseUrl;
    }

    private static baseEndpoint(): string {
        return `${this.getApiUrl()}/api/v1/ritual/calendar`;
    }

    private static authHeaders(email: string, token: string) {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Email: email,
        };
    }

    public static async getWeek(
        email: string,
        token: string,
        from: string,
        to: string,
    ): Promise<RitualMealPlanWeekInterface> {
        const params = new URLSearchParams({ from, to });
        const response = await fetchWithTokenRefresh(
            `${this.baseEndpoint()}?${params.toString()}`,
            { method: "GET", headers: this.authHeaders(email, token) },
        );
        if (!response.ok) throw new Error("Erreur lors de la récupération du calendrier ritual.");
        return response.json();
    }

    public static async upsert(
        email: string,
        token: string,
        body: UpsertMealPlanEntryRequest,
    ): Promise<RitualMealPlanEntryInterface> {
        const response = await fetchWithTokenRefresh(this.baseEndpoint(), {
            method: "PUT",
            headers: this.authHeaders(email, token),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Erreur lors de la mise à jour de l'entrée.");
        return response.json();
    }

    public static async deleteEntry(
        email: string,
        token: string,
        date: string,
        mealType: MealType,
    ): Promise<void> {
        const params = new URLSearchParams({ date, mealType });
        const response = await fetchWithTokenRefresh(
            `${this.baseEndpoint()}?${params.toString()}`,
            { method: "DELETE", headers: this.authHeaders(email, token) },
        );
        if (!response.ok) throw new Error("Erreur lors de la suppression de l'entrée.");
    }
}
