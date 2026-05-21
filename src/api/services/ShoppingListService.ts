import {
    CreateShoppingListItemRequest,
    CreateShoppingListRequest,
    IngredientSuggestionInterface,
    ShoppingListInterface,
    ShoppingListItemInterface,
    ShoppingListSummaryInterface,
    UpdateShoppingListItemRequest,
    UpdateShoppingListRequest,
} from "../interfaces/shopping/ShoppingListInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export default class ShoppingListService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    private static getApiUrl(): string {
        return this.port ? `${this.baseUrl}:${this.port}` : this.baseUrl;
    }

    private static endpoint(): string {
        return `${this.getApiUrl()}/api/v1/shopping-lists`;
    }

    private static ingredientsEndpoint(): string {
        return `${this.getApiUrl()}/api/v1/ingredients`;
    }

    private static authHeaders(email: string, token: string) {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Email: email,
        };
    }

    public static async list(
        email: string,
        token: string,
    ): Promise<ShoppingListSummaryInterface[]> {
        const response = await fetchWithTokenRefresh(this.endpoint(), {
            method: "GET",
            headers: this.authHeaders(email, token),
        });
        if (!response.ok) throw new Error("Erreur lors de la récupération des listes.");
        return response.json();
    }

    public static async get(
        email: string,
        token: string,
        uuid: string,
    ): Promise<ShoppingListInterface> {
        const response = await fetchWithTokenRefresh(`${this.endpoint()}/${uuid}`, {
            method: "GET",
            headers: this.authHeaders(email, token),
        });
        if (!response.ok) throw new Error("Erreur lors du chargement de la liste.");
        return response.json();
    }

    public static async create(
        email: string,
        token: string,
        body: CreateShoppingListRequest,
    ): Promise<ShoppingListInterface> {
        const response = await fetchWithTokenRefresh(this.endpoint(), {
            method: "POST",
            headers: this.authHeaders(email, token),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Erreur lors de la création de la liste.");
        return response.json();
    }

    public static async rename(
        email: string,
        token: string,
        uuid: string,
        body: UpdateShoppingListRequest,
    ): Promise<ShoppingListInterface> {
        const response = await fetchWithTokenRefresh(`${this.endpoint()}/${uuid}`, {
            method: "PATCH",
            headers: this.authHeaders(email, token),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Erreur lors du renommage de la liste.");
        return response.json();
    }

    public static async deleteList(
        email: string,
        token: string,
        uuid: string,
    ): Promise<void> {
        const response = await fetchWithTokenRefresh(`${this.endpoint()}/${uuid}`, {
            method: "DELETE",
            headers: this.authHeaders(email, token),
        });
        if (!response.ok) throw new Error("Erreur lors de la suppression de la liste.");
    }

    public static async addItem(
        email: string,
        token: string,
        uuid: string,
        body: CreateShoppingListItemRequest,
    ): Promise<ShoppingListItemInterface> {
        const response = await fetchWithTokenRefresh(`${this.endpoint()}/${uuid}/items`, {
            method: "POST",
            headers: this.authHeaders(email, token),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Erreur lors de l'ajout de l'article.");
        return response.json();
    }

    public static async updateItem(
        email: string,
        token: string,
        listUuid: string,
        itemUuid: string,
        body: UpdateShoppingListItemRequest,
    ): Promise<ShoppingListItemInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.endpoint()}/${listUuid}/items/${itemUuid}`,
            {
                method: "PATCH",
                headers: this.authHeaders(email, token),
                body: JSON.stringify(body),
            },
        );
        if (!response.ok) throw new Error("Erreur lors de la mise à jour de l'article.");
        return response.json();
    }

    public static async deleteItem(
        email: string,
        token: string,
        listUuid: string,
        itemUuid: string,
    ): Promise<void> {
        const response = await fetchWithTokenRefresh(
            `${this.endpoint()}/${listUuid}/items/${itemUuid}`,
            { method: "DELETE", headers: this.authHeaders(email, token) },
        );
        if (!response.ok) throw new Error("Erreur lors de la suppression de l'article.");
    }

    public static async searchIngredients(
        email: string,
        token: string,
        query: string,
        limit = 10,
    ): Promise<IngredientSuggestionInterface[]> {
        const params = new URLSearchParams({ q: query, limit: String(limit) });
        const response = await fetchWithTokenRefresh(
            `${this.ingredientsEndpoint()}/search?${params.toString()}`,
            { method: "GET", headers: this.authHeaders(email, token) },
        );
        if (!response.ok) throw new Error("Erreur lors de la recherche d'ingrédients.");
        return response.json();
    }
}
