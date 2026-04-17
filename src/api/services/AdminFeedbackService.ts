import BackendService from "./BackendService";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";
import type { AudienceQueryDTO } from "./AdminService";
import type { FeedbackForm } from "../../components/feedbacks/types";

export interface FeedbackCampaignSummary {
    templateId: string;
    firstCreatedAt: string;
    lastCreatedAt: string;
    total: number;
    readCount: number;
    answeredCount: number;
    dismissedCount: number;
    isCatalog: boolean;
}

export interface AudiencePreviewResponse {
    count: number;
    query: string;
}

export interface SendCampaignRequest {
    templateId?: string;
    form: FeedbackForm;
    audience: AudienceQueryDTO;
    triggerEvent?: string;
    priority?: number;
    showAfterSeconds?: number;
    dismissable?: boolean;
    expiresAt?: string;
}

export interface SendCampaignResponse {
    templateId: string;
    count: number;
}

export default class AdminFeedbackService {
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

    static previewCount(audience: AudienceQueryDTO): Promise<AudiencePreviewResponse> {
        return this.request("/api/v1/admin/feedback/preview-count", {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(audience),
        });
    }

    static sendCampaign(request: SendCampaignRequest): Promise<SendCampaignResponse> {
        return this.request("/api/v1/admin/feedback/send", {
            method: "POST",
            headers: this.getAuthHeaders(),
            body: JSON.stringify(request),
        });
    }

    static listCampaigns(): Promise<FeedbackCampaignSummary[]> {
        return this.request("/api/v1/admin/feedback/campaigns", {
            method: "GET",
            headers: this.getAuthHeaders(),
        });
    }
}
