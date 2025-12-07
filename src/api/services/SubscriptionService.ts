import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";
import {
    SubscriptionStatusInterface,
    CancelSubscriptionRequest
} from "../interfaces/subscription/SubscriptionStatusInterface";

export default class SubscriptionService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    public static async getSubscriptionStatus(
        email: string,
        token: string
    ): Promise<SubscriptionStatusInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.baseUrl}:${this.port}/api/v1/subscriptions/status`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Email': email
                },
            }
        );

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération du statut de l\'abonnement');
        }

        return response.json();
    }

    public static async cancelSubscription(
        email: string,
        token: string,
        request: CancelSubscriptionRequest
    ): Promise<SubscriptionStatusInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.baseUrl}:${this.port}/api/v1/subscriptions/cancel`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Email': email
                },
                body: JSON.stringify(request),
            }
        );

        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('Aucun abonnement actif à annuler');
            }
            throw new Error('Erreur lors de l\'annulation de l\'abonnement');
        }

        return response.json();
    }

    public static async reactivateSubscription(
        email: string,
        token: string
    ): Promise<SubscriptionStatusInterface> {
        const response = await fetchWithTokenRefresh(
            `${this.baseUrl}:${this.port}/api/v1/subscriptions/reactivate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Email': email
                },
            }
        );

        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('L\'abonnement n\'est pas en attente d\'annulation');
            }
            throw new Error('Erreur lors de la réactivation de l\'abonnement');
        }

        return response.json();
    }
}
