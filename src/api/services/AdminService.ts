import BackendService from "./BackendService";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";
import {
    AdminIngredientAcceptResponse,
    AdminIngredientMergeResponse,
    AdminIngredientReviewListDTO,
} from "../interfaces/admin/AdminIngredientReview";
import {
    AdminIngredientListItemDTO,
    AdminIngredientListPageDTO,
    AdminIngredientListParams,
    AdminIngredientMergeWithDeltaResponse,
    AdminIngredientNeighborsDTO,
    AdminIngredientOkResponse,
    UpdateIngredientRequestBody,
} from "../interfaces/admin/AdminIngredientCleanup";

export interface SetRoleResponse {
    status: string;
    email: string;
    role: string;
    message?: string;
}

export interface SchedulerStatusDTO {
    name: string;
    description: string;
    enabled: boolean;
}

export interface TriggerSchedulerResponse {
    status: string;
    scheduler: string;
    message?: string;
}

export interface UserRecipesInfoResponse {
    email: string;
    collectionsCount: number;
    recipesCount: number;
    recipesWithoutImageCount: number;
}

export interface BatchImageGenerationResponse {
    email: string;
    generatedCount: number;
    failedCount: number;
    totalWithoutImageBefore: number;
}

export interface TrackingTestResponse {
    provider: string;
    statusCode: number;
    responseBody: string;
    success: boolean;
}

export default class AdminService {

    private static getAuthHeaders() {
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("firebaseIdToken");
        if (!email || !token) throw new Error("Not authenticated");
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Email: email,
        };
    }

    private static async request<T>(url: string, options: RequestInit): Promise<T> {
        const response = await fetchWithTokenRefresh(
            `${BackendService.baseUrl}:${BackendService.port}${url}`,
            options
        );

        if (response.status === 403) throw new Error("Forbidden");

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            throw new Error(body.message || `Error ${response.status}`);
        }

        return response.json();
    }

    static async setUserPremium(targetEmail: string): Promise<SetRoleResponse> {
        return this.request("/api/v1/admin/set-premium", {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ email: targetEmail }),
        });
    }

    static async setUserMember(targetEmail: string): Promise<SetRoleResponse> {
        return this.request("/api/v1/admin/set-member", {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ email: targetEmail }),
        });
    }

    static async getSchedulers(): Promise<SchedulerStatusDTO[]> {
        return this.request("/api/v1/admin/schedulers", {
            method: "GET",
            headers: this.getAuthHeaders(),
        });
    }

    static async toggleScheduler(name: string): Promise<SchedulerStatusDTO> {
        return this.request(`/api/v1/admin/schedulers/${name}/toggle`, {
            method: "POST",
            headers: this.getAuthHeaders(),
        });
    }

    static async triggerScheduler(name: string): Promise<TriggerSchedulerResponse> {
        return this.request(`/api/v1/admin/schedulers/${name}/trigger`, {
            method: "POST",
            headers: this.getAuthHeaders(),
        });
    }

    static async getUserRecipesInfo(targetEmail: string): Promise<UserRecipesInfoResponse> {
        return this.request("/api/v1/admin/user-recipes-info", {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ email: targetEmail }),
        });
    }

    static async generateUserImages(targetEmail: string): Promise<BatchImageGenerationResponse> {
        return this.request("/api/v1/admin/generate-user-images", {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ email: targetEmail }),
        });
    }

    static async sendTrackingTestEvent(provider: "meta" | "tiktok", testEventCode?: string): Promise<TrackingTestResponse> {
        return this.request("/api/v1/admin/tracking/test", {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ provider, testEventCode: testEventCode || "" }),
        });
    }

    static async getAudienceCount(query: AudienceQueryDTO): Promise<{ count: number; query: string }> {
        return this.request("/api/v1/admin/notifications/audience-count", {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(query),
        });
    }

    static async createBroadcastNotification(data: {
        title: string;
        body: string;
        segment?: string | null;
        actionUrl?: string;
        iconType: string;
        expiresAt?: string | null;
        sendPush?: boolean;
        linkToStores?: boolean;
        audience?: AudienceQueryDTO | null;
    }): Promise<{ status: string; id: string }> {
        return this.request("/api/v1/admin/notifications", {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data),
        });
    }

    static async getAllBroadcastNotifications(): Promise<BroadcastNotificationDTO[]> {
        return this.request("/api/v1/admin/notifications", {
            method: "GET",
            headers: this.getAuthHeaders(),
        });
    }

    static async cancelBroadcastNotification(id: string): Promise<{ status: string; id: string }> {
        return this.request(`/api/v1/admin/notifications/${id}/cancel`, {
            method: "POST",
            headers: this.getAuthHeaders(),
        });
    }

    static async getNotificationTemplates(): Promise<NotificationTemplateDTO[]> {
        return this.request("/api/v1/admin/notifications/templates", {
            method: "GET",
            headers: this.getAuthHeaders(),
        });
    }

    static async sendTemplateToUser(email: string, templateKey: string): Promise<{ status: string; pushSent: boolean; inAppSent: boolean }> {
        return this.request("/api/v1/admin/notifications/send-template", {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ email, templateKey }),
        });
    }

    static async getInstagramAnalysisConfig(): Promise<InstagramAnalysisConfig> {
        return this.request("/api/v1/admin/instagram/analysis-config", {
            method: "GET",
            headers: this.getAuthHeaders(),
        });
    }

    static async setInstagramAnalysisApproach(approach: string): Promise<InstagramAnalysisConfig> {
        return this.request("/api/v1/admin/instagram/analysis-config", {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ approach }),
        });
    }

    static async getIngredientsNeedingReview(): Promise<AdminIngredientReviewListDTO> {
        return this.request("/api/v1/admin/ingredients/needs-review", {
            method: "GET",
            headers: this.getAuthHeaders(),
        });
    }

    static async mergeIngredient(sourceUuid: string, targetUuid: string): Promise<AdminIngredientMergeResponse> {
        return this.request(`/api/v1/admin/ingredients/${sourceUuid}/merge-into/${targetUuid}`, {
            method: "POST",
            headers: this.getAuthHeaders(),
        });
    }

    static async acceptIngredient(sourceUuid: string): Promise<AdminIngredientAcceptResponse> {
        return this.request(`/api/v1/admin/ingredients/${sourceUuid}/accept`, {
            method: "POST",
            headers: this.getAuthHeaders(),
        });
    }

    static async listIngredients(params: AdminIngredientListParams = {}): Promise<AdminIngredientListPageDTO> {
        const qs = new URLSearchParams();
        if (typeof params.page === "number") qs.set("page", String(params.page));
        if (typeof params.size === "number") qs.set("size", String(params.size));
        if (params.category && params.category.length > 0) qs.set("category", params.category);
        if (params.q && params.q.length > 0) qs.set("q", params.q);
        if (params.needsReviewOnly) qs.set("needsReviewOnly", "true");
        if (params.derivedFromOnly) qs.set("derivedFromOnly", "true");
        const query = qs.toString();
        const url = `/api/v1/admin/ingredients${query ? `?${query}` : ""}`;
        return this.request(url, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });
    }

    static async getIngredientNeighbors(uuid: string, limit?: number): Promise<AdminIngredientNeighborsDTO> {
        const qs = new URLSearchParams();
        if (typeof limit === "number") qs.set("limit", String(limit));
        const query = qs.toString();
        const url = `/api/v1/admin/ingredients/${uuid}/neighbors${query ? `?${query}` : ""}`;
        return this.request(url, {
            method: "GET",
            headers: this.getAuthHeaders(),
        });
    }

    static async mergeIngredientWithDelta(
        sourceUuid: string,
        targetUuid: string,
        preparationNoteDelta?: string
    ): Promise<AdminIngredientMergeWithDeltaResponse> {
        const options: RequestInit = {
            method: "POST",
            headers: this.getAuthHeaders(),
        };
        if (preparationNoteDelta !== undefined && preparationNoteDelta.length > 0) {
            options.body = JSON.stringify({ preparationNoteDelta });
        }
        return this.request(
            `/api/v1/admin/ingredients/${sourceUuid}/merge-into/${targetUuid}`,
            options
        );
    }

    static async deriveIngredientFrom(
        uuid: string,
        parentUuid: string,
        partLabel: string
    ): Promise<AdminIngredientOkResponse> {
        return this.request(`/api/v1/admin/ingredients/${uuid}/derive-from/${parentUuid}`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ partLabel }),
        });
    }

    static async clearIngredientDerivedFrom(uuid: string): Promise<AdminIngredientOkResponse> {
        return this.request(`/api/v1/admin/ingredients/${uuid}/derived-from`, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        });
    }

    static async dismissIngredientPair(a: string, b: string): Promise<AdminIngredientOkResponse> {
        return this.request(`/api/v1/admin/ingredients/dismiss-pair`, {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ a, b }),
        });
    }

    static async updateIngredient(
        uuid: string,
        body: UpdateIngredientRequestBody
    ): Promise<AdminIngredientListItemDTO> {
        const response = await fetchWithTokenRefresh(
            `${BackendService.baseUrl}:${BackendService.port}/api/v1/admin/ingredients/${uuid}`,
            {
                method: "PATCH",
                headers: this.getAuthHeaders(),
                body: JSON.stringify(body),
            }
        );

        if (response.status === 403) throw new Error("Forbidden");

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            if (response.status === 409) {
                throw new Error(
                    "Le nom normalisé est déjà utilisé par un autre ingrédient"
                );
            }
            const message =
                errorBody.error ||
                errorBody.message ||
                `Error ${response.status}`;
            throw new Error(message);
        }

        return response.json();
    }
}

export interface InstagramAnalysisConfig {
    currentApproach: string;
    effectiveApproach: string;
    approaches?: string[];
}

export interface NotificationTemplateDTO {
    key: string;
    title: string;
    body: string;
    iconType: string;
    actionUrl: string | null;
    push: boolean;
    inApp: boolean;
}

export interface AudienceConditionDTO {
    field: string;
    operator: string;
    value: string;
}

export interface AudienceQueryDTO {
    combinator: "AND" | "OR";
    conditions: AudienceConditionDTO[];
}

export interface BroadcastNotificationDTO {
    id: string;
    type: string;
    title: string;
    body: string;
    segment: string | null;
    iconType: string;
    actionUrl: string | null;
    createdAt: string;
    expiresAt: string | null;
}
