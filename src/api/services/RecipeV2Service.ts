import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";
import {
    RecipeV2DTO,
    RecipeV2ListDTO,
} from "../interfaces/v2/RecipeV2";

export class RecipeV2NotFoundError extends Error {
    constructor(message = "Recipe not found") {
        super(message);
        this.name = "RecipeV2NotFoundError";
    }
}

export class RecipeV2ForbiddenError extends Error {
    constructor(message = "Recipe is private") {
        super(message);
        this.name = "RecipeV2ForbiddenError";
    }
}

export default class RecipeV2Service {
    private static baseUrl: string = import.meta.env.VITE_API_URL;
    private static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        if (RecipeV2Service.port) {
            return `${RecipeV2Service.baseUrl}:${RecipeV2Service.port}`;
        }
        return RecipeV2Service.baseUrl;
    }

    private static buildHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("firebaseIdToken");
        if (email && token) {
            headers["Authorization"] = `Bearer ${token}`;
            headers["Email"] = email;
        }
        return headers;
    }

    public static async getRecipe(uuid: string): Promise<RecipeV2DTO> {
        const response = await fetchWithTokenRefresh(
            `${RecipeV2Service.getApiUrl()}/api/v2/recipes/${uuid}`,
            {
                method: "GET",
                headers: RecipeV2Service.buildHeaders(),
            },
        );

        if (response.status === 404) {
            throw new RecipeV2NotFoundError();
        }

        if (response.status === 403) {
            throw new RecipeV2ForbiddenError();
        }

        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération de la recette (status ${response.status})`);
        }

        return response.json();
    }

    public static async listRecipes(
        params?: { limit?: number; offset?: number },
    ): Promise<RecipeV2ListDTO> {
        const query = new URLSearchParams();
        if (params?.limit !== undefined) query.set("limit", String(params.limit));
        if (params?.offset !== undefined) query.set("offset", String(params.offset));
        const qs = query.toString();
        const url = `${RecipeV2Service.getApiUrl()}/api/v2/recipes${qs ? `?${qs}` : ""}`;

        const response = await fetchWithTokenRefresh(url, {
            method: "GET",
            headers: RecipeV2Service.buildHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération des recettes (status ${response.status})`);
        }

        return response.json();
    }
}
