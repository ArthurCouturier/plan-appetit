import { SandboxGenerateRequest } from "../interfaces/sandbox/SandboxGenerateRequest";
import { SandboxGenerateResponse } from "../interfaces/sandbox/SandboxGenerateResponse";
import { QuotaInfo } from "../interfaces/sandbox/QuotaInfo";
import { auth } from "../authentication/firebase";

export default class SandboxService {
    private static baseUrl: string = import.meta.env.VITE_API_URL;
    private static port: string = import.meta.env.VITE_API_PORT;

    private static async fetchWithOptionalAuth(
        url: string,
        options: RequestInit
    ): Promise<Response> {
        const user = auth.currentUser;

        if (user) {
            try {
                const token = await user.getIdToken();
                const headers = new Headers(options.headers);
                headers.set('Authorization', `Bearer ${token}`);
                headers.set('Email', user.email || '');

                return fetch(url, {
                    ...options,
                    headers
                });
            } catch (error) {
                console.warn('Erreur lors de l\'authentification, continuation en mode anonyme:', error);
            }
        }

        return fetch(url, options);
    }

    public static async generateRecipes(
        request: SandboxGenerateRequest
    ): Promise<SandboxGenerateResponse> {
        const response = await this.fetchWithOptionalAuth(
            `${this.baseUrl}:${this.port}/api/v1/sandbox/generate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            }
        );

        if (!response.ok) {
            if (response.status === 429) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    type: 'QUOTA_EXCEEDED',
                    message: errorData.message || 'Quota de génération épuisé',
                    quota: errorData.quota
                };
            }

            if (response.status === 400) {
                const errorData = await response.json().catch(() => ({}));
                throw {
                    type: 'VALIDATION_ERROR',
                    message: errorData.message || 'Erreur de validation de la requête'
                };
            }

            throw new Error('Erreur lors de la génération des recettes');
        }

        return response.json();
    }

    public static async getPlaceholders(): Promise<string[]> {
        try {
            const response = await fetch('/sandbox_placeholders.txt');

            if (!response.ok) {
                console.warn('Erreur lors du chargement des placeholders depuis le fichier');
                return this.getDefaultPlaceholders();
            }

            const text = await response.text();
            const placeholders = text
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            // Randomiser l'ordre des placeholders
            return this.shuffleArray(placeholders);
        } catch (error) {
            console.warn('Erreur lors du chargement des placeholders:', error);
            return this.getDefaultPlaceholders();
        }
    }

    private static shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    public static async getQuotaStatus(): Promise<QuotaInfo> {
        try {
            const response = await this.fetchWithOptionalAuth(
                `${this.baseUrl}:${this.port}/api/v1/sandbox/quota`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du quota');
            }

            return response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération du quota:', error);
            return {
                remainingFree: 3,
                limitFree: 3,
                isSubscriber: false
            };
        }
    }

    public static async linkAnonymousRecipe(recipeUuid: string): Promise<{
        success: boolean;
        error?: string;
        message?: string;
        quota?: QuotaInfo;
        alreadyLinked?: boolean;
    }> {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('Utilisateur non connecté');
        }

        const token = await user.getIdToken();

        const response = await fetch(
            `${this.baseUrl}:${this.port}/api/v1/sandbox/link-recipe`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Email': user.email || '',
                },
                body: JSON.stringify({ recipeUuid }),
            }
        );

        const data = await response.json().catch(() => ({}));

        if (response.status === 402) {
            return {
                success: false,
                error: data.error || 'INSUFFICIENT_CREDITS',
                message: data.message,
                quota: data.quota
            };
        }

        if (!response.ok) {
            console.error('Erreur lors de la liaison de la recette:', data);
            return {
                success: false,
                error: data.error,
                message: data.message
            };
        }

        return {
            success: data.success !== false,
            quota: data.quota,
            alreadyLinked: data.alreadyLinked
        };
    }

    private static getDefaultPlaceholders(): string[] {
        const defaults = [
            "Un dahl de lentilles corail rapide pour ce soir",
            "5 recettes autour de la courge butternut",
            "Un dessert sans lactose avec des poires",
            "Des idées de batch cooking pour 3 jours",
            "Une salade complète végétarienne pour l'été",
            "3 recettes de pâtes italiennes authentiques",
            "Un plat réconfortant pour l'hiver",
            "Des tapas espagnoles pour l'apéro",
            "Un curry thaï végétalien express",
            "Des recettes anti-gaspillage avec des légumes de saison"
        ];
        return this.shuffleArray(defaults);
    }
}
