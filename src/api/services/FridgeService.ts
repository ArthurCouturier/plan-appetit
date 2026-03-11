import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";
import {
    FridgeQuestionsRequest,
    FridgeQuestionsResponse,
    FridgeShoppingRequest,
    FridgeShoppingResponse,
    FridgeGenerateRequest,
} from "../interfaces/fridge/FridgeInterfaces";
import RecipeInterface from "../interfaces/recipes/RecipeInterface";

export default class FridgeService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        if (this.port) {
            return `${this.baseUrl}:${this.port}`;
        }
        return this.baseUrl;
    }

    public static async generateQuestions(
        request: FridgeQuestionsRequest,
        email: string,
        token: string
    ): Promise<FridgeQuestionsResponse> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/recipes/generate/fridge/questions`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
                body: JSON.stringify(request),
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors de la génération des questions");
        }

        return response.json();
    }

    public static async analyzeShopping(
        request: FridgeShoppingRequest,
        email: string,
        token: string
    ): Promise<FridgeShoppingResponse> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/recipes/generate/fridge/shopping`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
                body: JSON.stringify(request),
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors de l'analyse des courses");
        }

        return response.json();
    }

    public static async generateRecipe(
        request: FridgeGenerateRequest,
        email: string,
        token: string
    ): Promise<RecipeInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/recipes/generate/fridge`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
                body: JSON.stringify(request),
            }
        );

        if (response.status === 402) {
            const problem = await response.json().catch(() => ({}));
            throw { type: "INSUFFICIENT_CREDITS", detail: problem };
        }

        if (!response.ok) {
            throw new Error("Erreur lors de la génération de la recette");
        }

        return response.json();
    }
}
