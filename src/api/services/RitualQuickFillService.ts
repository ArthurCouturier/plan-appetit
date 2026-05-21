import { MealType } from "../interfaces/ritual/RitualDailyInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export const RITUAL_QUICK_FILL_MAX_LENGTH = 100;

interface QuickFillResponse {
    uuid: string;
    date: string;
    mealType: MealType;
    customText: string | null;
}

export default class RitualQuickFillService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        return this.port ? `${this.baseUrl}:${this.port}` : this.baseUrl;
    }

    public static async submit(
        email: string,
        token: string,
        mealType: MealType,
        customText: string,
    ): Promise<QuickFillResponse> {
        const safeText = customText.trim().slice(0, RITUAL_QUICK_FILL_MAX_LENGTH);
        if (!safeText) throw new Error("Texte vide.");
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/ritual/calendar/quick-fill`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
                body: JSON.stringify({ mealType, customText: safeText }),
            },
        );
        if (!response.ok) throw new Error("Erreur lors de la sauvegarde de la réponse rapide.");
        return response.json();
    }
}
