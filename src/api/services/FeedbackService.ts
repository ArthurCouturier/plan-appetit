import type { FeedbackAnswers, FeedbackForm, FeedbackPayload } from "../../components/feedbacks/types";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export default class FeedbackService {
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

    static async getPending(event?: string): Promise<FeedbackPayload | null> {
        const url = event
            ? `${this.getApiUrl()}/api/v1/feedback/pending?event=${encodeURIComponent(event)}`
            : `${this.getApiUrl()}/api/v1/feedback/pending`;
        const response = await fetchWithTokenRefresh(url, {
            method: "GET",
            headers: this.getHeaders(),
        });
        if (!response.ok) {
            return null;
        }
        const body = await response.json();
        return (body?.feedback as FeedbackPayload | null) ?? null;
    }

    static async answer(feedbackId: string, answers: FeedbackAnswers): Promise<void> {
        await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/feedback/answer/${feedbackId}`,
            {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify({ answers, dismissed: false }),
            }
        );
    }

    static async dismiss(feedbackId: string): Promise<void> {
        await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/feedback/dismiss/${feedbackId}`,
            {
                method: "POST",
                headers: this.getHeaders(),
            }
        );
    }

    static async requestByTemplate(templateId: string): Promise<{ templateId: string; form: FeedbackForm; dismissable: boolean } | null> {
        const response = await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/feedback/request`,
            {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify({ templateId }),
            }
        );
        if (!response.ok) return null;
        return response.json();
    }

    static async submitNew(templateId: string, answers: FeedbackAnswers): Promise<void> {
        await fetchWithTokenRefresh(
            `${this.getApiUrl()}/api/v1/feedback/submit`,
            {
                method: "POST",
                headers: this.getHeaders(),
                body: JSON.stringify({ templateId, answers }),
            }
        );
    }
}
