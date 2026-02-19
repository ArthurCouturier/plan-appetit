import BackendService from "./BackendService";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export interface DailyRecipeSummary {
    uuid: string;
    name: string;
    imageData: string | null;
}

export interface DailyRecipeDTO {
    date: string;
    quickRecipe: DailyRecipeSummary;
    expertRecipe: DailyRecipeSummary;
}

export default class DailyRecipeService {

    static async getDailyRecipes(): Promise<DailyRecipeDTO | null> {
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("firebaseIdToken");

        if (!email || !token) {
            return null;
        }

        const response = await fetchWithTokenRefresh(
            `${BackendService.baseUrl}:${BackendService.port}/api/v1/recipes/daily`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
            }
        );

        if (!response.ok) {
            return null;
        }

        return response.json();
    }
}
