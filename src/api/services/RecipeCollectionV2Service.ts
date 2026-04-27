import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";
import {
    RecipeCollectionV2BasicInfoDTO,
    RecipeCollectionV2DTO,
} from "../interfaces/v2/RecipeCollectionV2";

export class RecipeCollectionV2NotFoundError extends Error {
    constructor(message = "Collection not found") {
        super(message);
        this.name = "RecipeCollectionV2NotFoundError";
    }
}

export default class RecipeCollectionV2Service {
    private static baseUrl: string = import.meta.env.VITE_API_URL;
    private static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        if (RecipeCollectionV2Service.port) {
            return `${RecipeCollectionV2Service.baseUrl}:${RecipeCollectionV2Service.port}`;
        }
        return RecipeCollectionV2Service.baseUrl;
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

    public static async getDefaultCollection(): Promise<RecipeCollectionV2BasicInfoDTO> {
        const response = await fetchWithTokenRefresh(
            `${RecipeCollectionV2Service.getApiUrl()}/api/v2/collections/default`,
            {
                method: "GET",
                headers: RecipeCollectionV2Service.buildHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération de la collection par défaut (status ${response.status})`);
        }

        return response.json();
    }

    public static async getRootCollections(): Promise<RecipeCollectionV2BasicInfoDTO[]> {
        const response = await fetchWithTokenRefresh(
            `${RecipeCollectionV2Service.getApiUrl()}/api/v2/collections/root`,
            {
                method: "GET",
                headers: RecipeCollectionV2Service.buildHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération des collections racines (status ${response.status})`);
        }

        return response.json();
    }

    public static async getAllCollections(): Promise<RecipeCollectionV2BasicInfoDTO[]> {
        const response = await fetchWithTokenRefresh(
            `${RecipeCollectionV2Service.getApiUrl()}/api/v2/collections/all`,
            {
                method: "GET",
                headers: RecipeCollectionV2Service.buildHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération de toutes les collections (status ${response.status})`);
        }

        return response.json();
    }

    public static async getCollection(uuid: string): Promise<RecipeCollectionV2DTO> {
        const response = await fetchWithTokenRefresh(
            `${RecipeCollectionV2Service.getApiUrl()}/api/v2/collections/${uuid}`,
            {
                method: "GET",
                headers: RecipeCollectionV2Service.buildHeaders(),
            },
        );

        if (response.status === 404) {
            throw new RecipeCollectionV2NotFoundError();
        }

        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération de la collection (status ${response.status})`);
        }

        return response.json();
    }
}
