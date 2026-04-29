import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";
import type {
    BatchCookingV2DTO,
    BatchCookingV2ListDTO,
} from "../interfaces/v2/BatchCookingV2";

export class BatchCookingV2NotFoundError extends Error {
    constructor(message = "Batch cooking not found") {
        super(message);
        this.name = "BatchCookingV2NotFoundError";
    }
}

export class BatchCookingV2ForbiddenError extends Error {
    constructor(message = "Batch cooking is private") {
        super(message);
        this.name = "BatchCookingV2ForbiddenError";
    }
}

export default class BatchCookingV2Service {
    private static baseUrl: string = import.meta.env.VITE_API_URL;
    private static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        if (BatchCookingV2Service.port) {
            return `${BatchCookingV2Service.baseUrl}:${BatchCookingV2Service.port}`;
        }
        return BatchCookingV2Service.baseUrl;
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

    public static async getById(uuid: string): Promise<BatchCookingV2DTO> {
        const response = await fetchWithTokenRefresh(
            `${BatchCookingV2Service.getApiUrl()}/api/v2/batch-cooking/${uuid}`,
            { method: "GET", headers: BatchCookingV2Service.buildHeaders() },
        );

        if (response.status === 404) throw new BatchCookingV2NotFoundError();
        if (response.status === 403) throw new BatchCookingV2ForbiddenError();
        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération du batch cooking (status ${response.status})`);
        }
        return response.json();
    }

    public static async getAll(): Promise<BatchCookingV2ListDTO> {
        const response = await fetchWithTokenRefresh(
            `${BatchCookingV2Service.getApiUrl()}/api/v2/batch-cooking/all`,
            { method: "GET", headers: BatchCookingV2Service.buildHeaders() },
        );
        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération des batch cookings (status ${response.status})`);
        }
        return response.json();
    }

    /**
     * DELETE idempotent : 204 retourné même si le BC n'existait déjà plus.
     * Le caller peut appeler en parallèle le DELETE v0 (`/api/v1/batch-cooking/{uuid}`)
     * pendant la fenêtre de coexistence pour nettoyer les deux schémas.
     */
    public static async delete(uuid: string): Promise<void> {
        const response = await fetchWithTokenRefresh(
            `${BatchCookingV2Service.getApiUrl()}/api/v2/batch-cooking/${uuid}`,
            { method: "DELETE", headers: BatchCookingV2Service.buildHeaders() },
        );
        if (!response.ok && response.status !== 404) {
            throw new Error(`Erreur lors de la suppression du batch cooking v2 (status ${response.status})`);
        }
    }
}
