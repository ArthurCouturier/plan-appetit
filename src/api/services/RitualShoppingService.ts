import {
    CreateShoppingItemRequest,
    RitualShoppingItemInterface,
    UpdateShoppingItemRequest,
} from "../interfaces/ritual/RitualShoppingInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export default class RitualShoppingService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        return this.port ? `${this.baseUrl}:${this.port}` : this.baseUrl;
    }

    private static baseEndpoint(): string {
        return `${this.getApiUrl()}/api/v1/ritual/shopping`;
    }

    private static authHeaders(email: string, token: string) {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Email: email,
        };
    }

    public static async list(email: string, token: string): Promise<RitualShoppingItemInterface[]> {
        const response = await fetchWithTokenRefresh(this.baseEndpoint(), {
            method: "GET",
            headers: this.authHeaders(email, token),
        });
        if (!response.ok) throw new Error("Erreur lors du chargement de la liste.");
        return response.json();
    }

    public static async create(
        email: string,
        token: string,
        body: CreateShoppingItemRequest,
    ): Promise<RitualShoppingItemInterface> {
        const response = await fetchWithTokenRefresh(this.baseEndpoint(), {
            method: "POST",
            headers: this.authHeaders(email, token),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Erreur lors de l'ajout.");
        return response.json();
    }

    public static async update(
        email: string,
        token: string,
        uuid: string,
        body: UpdateShoppingItemRequest,
    ): Promise<RitualShoppingItemInterface> {
        const response = await fetchWithTokenRefresh(`${this.baseEndpoint()}/${uuid}`, {
            method: "PATCH",
            headers: this.authHeaders(email, token),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Erreur lors de la mise à jour.");
        return response.json();
    }

    public static async remove(email: string, token: string, uuid: string): Promise<void> {
        const response = await fetchWithTokenRefresh(`${this.baseEndpoint()}/${uuid}`, {
            method: "DELETE",
            headers: this.authHeaders(email, token),
        });
        if (!response.ok) throw new Error("Erreur lors de la suppression.");
    }
}
