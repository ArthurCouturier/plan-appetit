import BackendService from "./BackendService";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

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
