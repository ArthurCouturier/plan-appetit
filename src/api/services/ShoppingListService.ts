import {
    AddShoppingListMemberRequest,
    CreateShoppingListItemRequest,
    CreateShoppingListRequest,
    IngredientSuggestionInterface,
    ReconcileShoppingListRequest,
    ShoppingListInterface,
    ShoppingListItemInterface,
    ShoppingListSseEvent,
    ShoppingListSummaryInterface,
    UpdateShoppingListItemRequest,
    UpdateShoppingListRequest,
} from "../interfaces/shopping/ShoppingListInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";
import { openSseConnection, SseClientOptions } from "./SseClient";

export class ShoppingListLimitReachedError extends Error {
    readonly limit: number;
    constructor(limit: number) {
        super(`Limite de ${limit} listes atteinte.`);
        this.name = "ShoppingListLimitReachedError";
        this.limit = limit;
    }
}

export class MemberLimitReachedError extends Error {
    readonly limit: number;
    constructor(limit: number) {
        super(`Limite de ${limit} membres par liste atteinte.`);
        this.name = "MemberLimitReachedError";
        this.limit = limit;
    }
}

export class UserNotFoundError extends Error {
    constructor() {
        super("Utilisateur introuvable sur Plan'Appétit.");
        this.name = "UserNotFoundError";
    }
}

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

    /** Timeout court pour les reads : fail fast offline plutôt que d'attendre 180s. */
    private static readonly READ_TIMEOUT_MS = 8_000;

    public static async list(
        email: string,
        token: string,
    ): Promise<ShoppingListSummaryInterface[]> {
        const response = await fetchWithTokenRefresh(
            this.endpoint(),
            { method: "GET", headers: this.authHeaders(email, token) },
            2,
            this.READ_TIMEOUT_MS,
        );
        if (!response.ok) throw new Error("Erreur lors de la récupération des listes.");
        return response.json();
    }

    public static async get(
        email: string,
        token: string,
        uuid: string,
    ): Promise<ShoppingListInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.endpoint()}/${uuid}`,
            { method: "GET", headers: this.authHeaders(email, token) },
            2,
            this.READ_TIMEOUT_MS,
        );
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
        if (response.status === 409) {
            const payload = await response.json().catch(() => null) as { code?: string; limit?: number } | null;
            if (payload?.code === "LIST_LIMIT_REACHED") {
                throw new ShoppingListLimitReachedError(payload.limit ?? 20);
            }
        }
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

    public static async reconcile(
        email: string,
        token: string,
        uuid: string,
        body: ReconcileShoppingListRequest,
    ): Promise<ShoppingListInterface> {
        const response = await fetchWithTokenRefresh(`${this.endpoint()}/${uuid}/reconcile`, {
            method: "POST",
            headers: this.authHeaders(email, token),
            body: JSON.stringify(body),
        });
        if (!response.ok) throw new Error("Erreur lors de la resynchronisation.");
        return response.json();
    }

    public static async addMember(
        email: string,
        token: string,
        listUuid: string,
        body: AddShoppingListMemberRequest,
    ): Promise<ShoppingListInterface> {
        const response = await fetchWithTokenRefresh(`${this.endpoint()}/${listUuid}/members`, {
            method: "POST",
            headers: this.authHeaders(email, token),
            body: JSON.stringify(body),
        });
        if (response.status === 404) {
            const payload = await response.json().catch(() => null) as { code?: string } | null;
            if (payload?.code === "USER_NOT_FOUND") throw new UserNotFoundError();
        }
        if (response.status === 409) {
            const payload = await response.json().catch(() => null) as { code?: string; limit?: number } | null;
            if (payload?.code === "MEMBER_LIMIT_REACHED") {
                throw new MemberLimitReachedError(payload.limit ?? 10);
            }
        }
        if (!response.ok) throw new Error("Erreur lors de l'ajout du membre.");
        return response.json();
    }

    public static async removeMember(
        email: string,
        token: string,
        listUuid: string,
        targetUserUid: string,
    ): Promise<ShoppingListInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.endpoint()}/${listUuid}/members/${encodeURIComponent(targetUserUid)}`,
            { method: "DELETE", headers: this.authHeaders(email, token) },
        );
        if (!response.ok) throw new Error("Erreur lors du retrait du membre.");
        return response.json();
    }

    public static async leaveList(
        email: string,
        token: string,
        listUuid: string,
    ): Promise<ShoppingListInterface> {
        const response = await fetchWithTokenRefresh(`${this.endpoint()}/${listUuid}/leave`, {
            method: "DELETE",
            headers: this.authHeaders(email, token),
        });
        if (!response.ok) throw new Error("Erreur lors du départ de la liste.");
        return response.json();
    }

    public static async joinByInviteToken(
        email: string,
        token: string,
        inviteToken: string,
    ): Promise<ShoppingListInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.endpoint()}/join/${encodeURIComponent(inviteToken)}`,
            { method: "POST", headers: this.authHeaders(email, token) },
        );
        if (response.status === 409) {
            const payload = await response.json().catch(() => null) as { code?: string; limit?: number } | null;
            if (payload?.code === "MEMBER_LIMIT_REACHED") {
                throw new MemberLimitReachedError(payload.limit ?? 10);
            }
        }
        if (!response.ok) throw new Error("Lien invalide ou expiré.");
        return response.json();
    }

    public static async addFromRecipe(
        email: string,
        token: string,
        listUuid: string,
        recipeUuid: string,
    ): Promise<ShoppingListItemInterface[]> {
        const response = await fetchWithTokenRefresh(
            `${this.endpoint()}/${listUuid}/items/from-recipe`,
            {
                method: "POST",
                headers: this.authHeaders(email, token),
                body: JSON.stringify({ recipeUuid }),
            },
        );
        if (!response.ok) throw new Error("Erreur lors de l'ajout des ingrédients de la recette.");
        return response.json();
    }

    public static subscribeEvents(
        email: string,
        token: string,
        listUuid: string,
        handlers: Pick<SseClientOptions<ShoppingListSseEvent>, "onOpen" | "onMessage" | "onError" | "onClose">,
    ): AbortController {
        return openSseConnection<ShoppingListSseEvent>({
            url: `${this.endpoint()}/${listUuid}/events`,
            headers: this.authHeaders(email, token),
            ...handlers,
        });
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
