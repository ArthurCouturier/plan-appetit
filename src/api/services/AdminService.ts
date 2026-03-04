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
}
