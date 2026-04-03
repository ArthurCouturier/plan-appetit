import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";
import type {
    BatchCookingRequest,
    BatchCookingResponse,
} from "../interfaces/batchcooking/BatchCookingInterfaces";

export default class BatchCookingService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        if (this.port) {
            return `${this.baseUrl}:${this.port}`;
        }
        return this.baseUrl;
    }

    public static async generate(
        request: BatchCookingRequest,
        email: string,
        token: string
    ): Promise<BatchCookingResponse> {
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
