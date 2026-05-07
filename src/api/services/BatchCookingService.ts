import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";
import type {
    BatchCookingRequest,
    BatchCookingResponse,
} from "../interfaces/batchcooking/BatchCookingInterfaces";

export interface BatchCookingTurnHistory {
    questionId: string;
    questionPrompt: string;
    answer: string;
}

export interface BatchCookingTurnOption {
    value: string;
    label: string;
}

export interface BatchCookingTurnQuestion {
    id: string;
    prompt: string;
    explanation?: string | null;
    type: "choice";
    options: BatchCookingTurnOption[];
    allowFreeText: boolean;
}

export interface BatchCookingTurnRequest {
    turnIndex: number;
    turns: BatchCookingTurnHistory[];
    totalMeals: number;
    defaultPeopleCount?: number | null;
    mode: string;
    cuisineStyles: string[];
    dietaryRestrictions: string[];
    budgetTarget: string;
    availableEquipment: string[];
    excludedIngredients: string[];
    skipQuestions?: boolean;
}

export interface BatchCookingTurnResponse {
    turnIndex: number;
    ready: boolean;
    nextQuestion?: BatchCookingTurnQuestion | null;
}

export interface BatchCookingGenerateResponse {
    batchCookingUuid: string;
    recipeUuids: string[];
}

export default class BatchCookingService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        if (this.port) {
            return `${this.baseUrl}:${this.port}`;
        }
        return this.baseUrl;
    }

    /**
     * Génère un batch cooking en v2-native. Le backend retourne uniquement les UUIDs
     * (le DTO complet est ensuite récupéré via BatchCookingV2Service.getById).
     */
    public static async generate(
        request: BatchCookingRequest & { turns?: BatchCookingTurnHistory[] },
        email: string,
        token: string
    ): Promise<BatchCookingGenerateResponse> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/batch-cooking/generate`,
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
            throw new Error("Erreur lors de la generation du batch cooking");
        }

        return response.json();
    }

    /**
     * Step conversationnel optionnel — appelé entre le formulaire single-form et /generate.
     * Pattern miroir de la guided sandbox (5 turns max, contexte cumulatif).
     */
    public static async turn(
        request: BatchCookingTurnRequest,
        email: string,
        token: string
    ): Promise<BatchCookingTurnResponse> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/batch-cooking/turn`,
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
            throw new Error("Erreur lors de la question batch cooking");
        }

        return response.json();
    }

    public static async getById(
        uuid: string,
        email: string,
        token: string
    ): Promise<BatchCookingResponse> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/batch-cooking/${uuid}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors de la recuperation du batch cooking");
        }

        return response.json();
    }

    public static async getAll(
        email: string,
        token: string
    ): Promise<BatchCookingResponse[]> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/batch-cooking/all`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors de la recuperation des batch cookings");
        }

        return response.json();
    }

    public static async delete(
        uuid: string,
        email: string,
        token: string
    ): Promise<void> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/batch-cooking/${uuid}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Erreur lors de la suppression du batch cooking");
        }
    }
}
