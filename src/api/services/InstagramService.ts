export interface InstagramPostInfo {
    url: string;
    description: string;
    title: string;
    imageUrl: string | null;
    imageBase64: string | null;
}

export interface GeneratedRecipeResponse {
    message: string;
    recipe: any;
    debug?: {
        frameCount: number;
        frames: string[];
        frameAnalyses: string[];
        audioTranscription: string | null;
    };
}

/**
 * Question adaptative (path "Remasteriser") — même shape que FridgeQuestion côté back :
 * BOOLEAN / CHOICE / LEVEL / SLIDER. UI swipable réutilise les composants fridge.
 */
export interface InstagramTwistQuestion {
    id: string;
    type: 'slider' | 'level' | 'boolean' | 'choice';
    label: string;
    emoji: string;
    explanation: string | null;
    min: number | null;
    max: number | null;
    plusLabel: string | null;
    options: string[] | null;
    allowFreeText: boolean | null;
}

/** Réponse du démarrage : analyse + 1ère question retournée d'un coup. */
export interface InstagramQuestionsStartResponse {
    analysisToken: string;
    question: InstagramTwistQuestion | null;
    done: boolean;
}

/** Réponse d'un tour suivant : prochaine question OU done=true. */
export interface InstagramQuestionsNextResponse {
    question: InstagramTwistQuestion | null;
    done: boolean;
}

export default class InstagramService {
    private static baseUrl: string = import.meta.env.VITE_API_URL;
    private static port: string = import.meta.env.VITE_API_PORT;

    public static async fetchPostInfo(instagramUrl: string): Promise<InstagramPostInfo> {
        const response = await fetch(
            `${this.baseUrl}:${this.port}/api/v1/instagram/fetch`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: instagramUrl }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Erreur lors de la récupération des informations');
        }

        return response.json();
    }

    public static async generateRecipeFromPost(
        instagramUrl: string,
        email: string,
        token: string,
        twistArgs?: { analysisToken: string; answers: Record<string, unknown> },
    ): Promise<GeneratedRecipeResponse> {
        const { fetchWithTokenRefresh } = await import('../utils/fetchWithTokenRefresh');

        const body: Record<string, unknown> = { url: instagramUrl };
        if (twistArgs) {
            body.twist = true;
            body.analysisToken = twistArgs.analysisToken;
            body.answers = twistArgs.answers;
        }

        const response = await fetchWithTokenRefresh(
            `${this.baseUrl}:${this.port}/api/v1/instagram/generate-recipe`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Email': email,
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            if (response.status === 402) {
                throw {
                    type: 'QUOTA_EXCEEDED',
                    message: errorData.error || 'Quota de génération épuisé',
                    status: 402
                };
            }

            // 410 Gone → analysisToken expiré (10 min). Front doit relancer /questions.
            if (response.status === 410) {
                throw {
                    type: 'ANALYSIS_EXPIRED',
                    message: errorData.error || 'Analyse expirée, recommence',
                    status: 410,
                };
            }

            throw new Error(errorData.error || 'Erreur lors de la génération de la recette');
        }

        return response.json();
    }

    /**
     * Étape 1 turn-by-turn : analyse vidéo + 1ère question. Pas de crédit consommé
     * (le crédit part au moment de la génération finale via generateRecipeFromPost).
     */
    public static async startTwistQuestions(
        instagramUrl: string,
        email: string,
        token: string,
    ): Promise<InstagramQuestionsStartResponse> {
        const { fetchWithTokenRefresh } = await import('../utils/fetchWithTokenRefresh');

        const response = await fetchWithTokenRefresh(
            `${this.baseUrl}:${this.port}/api/v1/instagram/questions`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Email': email,
                },
                body: JSON.stringify({ url: instagramUrl }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Erreur lors de la génération des questions');
        }

        return response.json();
    }

    /**
     * Étapes suivantes turn-by-turn : on renvoie l'historique cumulatif (questions
     * déjà posées + answers user) et le back retourne la prochaine question ou done=true.
     */
    public static async nextTwistQuestion(
        analysisToken: string,
        askedQuestions: InstagramTwistQuestion[],
        answers: Record<string, unknown>,
        email: string,
        token: string,
    ): Promise<InstagramQuestionsNextResponse> {
        const { fetchWithTokenRefresh } = await import('../utils/fetchWithTokenRefresh');

        const response = await fetchWithTokenRefresh(
            `${this.baseUrl}:${this.port}/api/v1/instagram/questions/next`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Email': email,
                },
                body: JSON.stringify({ analysisToken, askedQuestions, answers }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 410) {
                throw { type: 'ANALYSIS_EXPIRED', message: errorData.error, status: 410 };
            }
            throw new Error(errorData.error || 'Erreur lors de la génération de la question suivante');
        }

        return response.json();
    }
}
