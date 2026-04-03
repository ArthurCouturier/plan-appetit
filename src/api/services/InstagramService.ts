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
    ): Promise<GeneratedRecipeResponse> {
        const { fetchWithTokenRefresh } = await import('../utils/fetchWithTokenRefresh');

        const response = await fetchWithTokenRefresh(
            `${this.baseUrl}:${this.port}/api/v1/instagram/generate-recipe`,
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

            if (response.status === 402) {
                throw {
                    type: 'QUOTA_EXCEEDED',
                    message: errorData.error || 'Quota de génération épuisé',
                    status: 402
                };
            }

            throw new Error(errorData.error || 'Erreur lors de la génération de la recette');
        }

        return response.json();
    }
}
