import type { FridgeQuestion } from "../interfaces/fridge/FridgeInterfaces";

export interface PhotoImportRecipeResponse {
    message: string;
    recipe: { uuid: string; name: string } | null;
}

/** Réponse du démarrage "Remasteriser" : analyse de la photo + 1ère question d'un coup. */
export interface PhotoImportQuestionsStartResponse {
    analysisToken: string;
    question: FridgeQuestion | null;
    done: boolean;
}

/** Réponse d'un tour suivant : prochaine question OU done=true. */
export interface PhotoImportQuestionsNextResponse {
    question: FridgeQuestion | null;
    done: boolean;
}

/**
 * Service d'import de recette par photo. Calque le contrat d'InstagramService
 * (recette exacte + remaster turn-by-turn) mais l'entrée est une image base64
 * capturée sur l'appareil plutôt qu'une URL Instagram. Les questions adaptatives
 * réutilisent le type FridgeQuestion (UI QuestionCard partagée).
 */
export default class PhotoImportService {
    private static baseUrl: string = import.meta.env.VITE_API_URL;
    private static port: string = import.meta.env.VITE_API_PORT;

    private static apiUrl(): string {
        return this.port ? `${this.baseUrl}:${this.port}` : this.baseUrl;
    }

    /**
     * Génère une recette à partir de la photo. Sans twistArgs → recette exacte.
     * Avec twistArgs → remasterisation (le crédit est consommé ici dans les deux cas).
     */
    public static async generateRecipeFromPhoto(
        imageBase64: string,
        email: string,
        token: string,
        twistArgs?: { analysisToken: string; answers: Record<string, unknown> },
    ): Promise<PhotoImportRecipeResponse> {
        const { fetchWithTokenRefresh } = await import("../utils/fetchWithTokenRefresh");

        // Sur le path twist, tout vient du cache d'analyse côté back : inutile de renvoyer
        // l'image (lourde). Sur le path exact, l'image est la seule source.
        const body: Record<string, unknown> = twistArgs
            ? { twist: true, analysisToken: twistArgs.analysisToken, answers: twistArgs.answers }
            : { imageBase64 };

        const response = await fetchWithTokenRefresh(
            `${this.apiUrl()}/api/v1/photo-import/generate-recipe`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
                body: JSON.stringify(body),
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 402) {
                throw { type: "QUOTA_EXCEEDED", message: errorData.error || "Quota de génération épuisé", status: 402 };
            }
            // 410 Gone → analysisToken expiré. Front doit relancer /questions.
            if (response.status === 410) {
                throw { type: "ANALYSIS_EXPIRED", message: errorData.error || "Analyse expirée, recommence", status: 410 };
            }
            throw new Error(errorData.error || "Erreur lors de la génération de la recette");
        }

        return response.json();
    }

    /**
     * Étape 1 turn-by-turn : analyse la photo + 1ère question. Pas de crédit consommé
     * (le crédit part à la génération finale via generateRecipeFromPhoto).
     */
    public static async startTwistQuestions(
        imageBase64: string,
        email: string,
        token: string,
    ): Promise<PhotoImportQuestionsStartResponse> {
        const { fetchWithTokenRefresh } = await import("../utils/fetchWithTokenRefresh");

        const response = await fetchWithTokenRefresh(
            `${this.apiUrl()}/api/v1/photo-import/questions`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
                body: JSON.stringify({ imageBase64 }),
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Erreur lors de la génération des questions");
        }

        return response.json();
    }

    /**
     * Étapes suivantes turn-by-turn : on renvoie l'historique cumulatif (questions posées
     * + answers user), le back retourne la prochaine question ou done=true.
     */
    public static async nextTwistQuestion(
        analysisToken: string,
        askedQuestions: FridgeQuestion[],
        answers: Record<string, unknown>,
        email: string,
        token: string,
    ): Promise<PhotoImportQuestionsNextResponse> {
        const { fetchWithTokenRefresh } = await import("../utils/fetchWithTokenRefresh");

        const response = await fetchWithTokenRefresh(
            `${this.apiUrl()}/api/v1/photo-import/questions/next`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                    Email: email,
                },
                body: JSON.stringify({ analysisToken, askedQuestions, answers }),
            },
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 410) {
                throw { type: "ANALYSIS_EXPIRED", message: errorData.error, status: 410 };
            }
            throw new Error(errorData.error || "Erreur lors de la génération de la question suivante");
        }

        return response.json();
    }
}
