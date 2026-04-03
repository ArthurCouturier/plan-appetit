import { NotificationPageInterface } from "../interfaces/notifications/NotificationInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export default class InAppNotificationService {
    private static getApiUrl(): string {
        const baseUrl = import.meta.env.VITE_API_URL;
        const port = import.meta.env.VITE_API_PORT;
        return port ? `${baseUrl}:${port}` : baseUrl;
    }

    private static getHeaders(): Record<string, string> {
        const token = localStorage.getItem("firebaseIdToken") || "";
        const email = localStorage.getItem("email") || "";
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Email: email,
        };
    }

    static async getNotifications(page: number = 0): Promise<NotificationPageInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/notifications?page=${page}`,
            { method: "GET", headers: this.getHeaders() }
        );
        if (!response.ok) throw new Error("Failed to fetch notifications");
        return response.json();
    }

    static async sync(): Promise<{ latestId: string | null; unreadCount: number; hasPendingBroadcasts: boolean }> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/notifications/sync`,
            { method: "GET", headers: this.getHeaders() }
        );
        if (!response.ok) throw new Error("Failed to sync notifications");
        return response.json();
    }

    static async markAsRead(id: string): Promise<void> {
        await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/notifications/${id}/read`,
            { method: "POST", headers: this.getHeaders() }
        );
    }

    static async markAsUnread(id: string): Promise<void> {
        await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/notifications/${id}/unread`,
            { method: "POST", headers: this.getHeaders() }
        );
    }

    static async markAllAsRead(): Promise<void> {
        await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/notifications/read-all`,
            { method: "POST", headers: this.getHeaders() }
        );
    }
}
