import { MealType } from "../interfaces/ritual/RitualDailyInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

interface TestPushResponse {
    success: boolean;
    targetUid?: string;
    mealType?: string;
    message?: string;
}

export default class RitualAdminService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        return this.port ? `${this.baseUrl}:${this.port}` : this.baseUrl;
    }

    public static async testPush(
        email: string,
        token: string,
        mealType: MealType,
        targetUserUid?: string,
    ): Promise<TestPushResponse> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/admin/ritual/test-push`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
                body: JSON.stringify({ mealType, targetUserUid: targetUserUid ?? null }),
            },
        );
        if (response.status === 403) {
            return { success: false, message: "Réservé aux administrateurs." };
        }
        if (!response.ok) {
            return { success: false, message: "Erreur inattendue." };
        }
        return response.json();
    }
}
