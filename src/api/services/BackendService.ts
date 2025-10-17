import { redirect } from "react-router-dom";
import RecipeGenerationParametersInterface from "../interfaces/recipes/RecipeGenerationParametersInterface";
import RecipeInterface from "../interfaces/recipes/RecipeInterface";
import UserInterface from "../interfaces/users/UserInterface";
import { auth } from "../authentication/firebase";

export default class BackendService {
    private baseUrl: string;
    private port: string;
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    constructor() {
        this.baseUrl = import.meta.env.VITE_API_URL as string;
        this.port = import.meta.env.VITE_API_PORT as string;
    }

    /**
     * Effectue une requête fetch avec gestion automatique du refresh du token Firebase
     * en cas d'erreur 401 TOKEN_EXPIRED
     */
    private static async fetchWithTokenRefresh(
        url: string,
        options: RequestInit
    ): Promise<Response> {
        // Première tentative
        let response = await fetch(url, options);

        // Si erreur 401, vérifier si c'est TOKEN_EXPIRED
        if (response.status === 401) {
            try {
                const errorData = await response.json();

                if (errorData.error === 'TOKEN_EXPIRED') {
                    console.log('Token expiré, rafraîchissement automatique...');

                    // Récupérer l'utilisateur Firebase actuel
                    const user = auth.currentUser;

                    if (user) {
                        // Forcer le refresh du token
                        const newToken = await user.getIdToken(true);

                        // Mettre à jour le token dans localStorage
                        localStorage.setItem('firebaseIdToken', newToken);

                        // Mettre à jour le header Authorization avec le nouveau token
                        const newHeaders = new Headers(options.headers);
                        newHeaders.set('Authorization', `Bearer ${newToken}`);

                        // Retry la requête avec le nouveau token
                        response = await fetch(url, {
                            ...options,
                            headers: newHeaders,
                        });

                        console.log('✅ Token rafraîchi et requête réessayée avec succès');
                    } else {
                        throw new Error('Utilisateur non authentifié');
                    }
                }
            } catch (error) {
                // Si l'erreur n'est pas du JSON ou autre problème, retourner la réponse originale
                console.error('Erreur lors du refresh du token:', error);
            }
        }

        return response;
    }

    public static async registerNewUser(user: UserInterface, token: string): Promise<UserInterface> {
        console.log("token", token)
        const response = await this.fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(user),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération du profil');
        }

        return response.json();
    }

    public async updateSomething(data: unknown, email: string, token: string): Promise<unknown> {
        const response = await BackendService.fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/something`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour');
        }

        return response.json();
    }

    public async updateRecipe(
        recipe: RecipeInterface,
        email: string,
        token: string
    ): Promise<RecipeInterface[]> {
        return this.updateSomething(recipe, email, token) as Promise<RecipeInterface[]>;
    }

    public static async getPersonalRecipes(
        email: string,
        token: string
    ): Promise<RecipeInterface[]> {
        const response = await this.fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email,
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour');
        }

        return response.json();
    }

    public static async createNewEmptyRecipe(
        email: string,
        token: string
    ): Promise<RecipeInterface> {
        const response = await this.fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email,
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour');
        }

        const newRecipe: Promise<RecipeInterface> = response.json().then((recipe) => {
            const allRecipes: RecipeInterface[] = localStorage.getItem("recipes") ? JSON.parse(localStorage.getItem("recipes") as string) : [];
            allRecipes.push(recipe);
            localStorage.setItem("recipes", JSON.stringify(allRecipes));
            return recipe;
        });

        return newRecipe;
    }

    public static async importRecipeFromLocalFile(
        recipe: RecipeInterface,
        email: string,
        token: string
    ): Promise<RecipeInterface> {
        const response = await this.fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email,
            },
            body: JSON.stringify(recipe),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour');
        }

        const newRecipe: Promise<RecipeInterface> = response.json().then((recipe) => {
            const allRecipes: RecipeInterface[] = localStorage.getItem("recipes") ? JSON.parse(localStorage.getItem("recipes") as string) : [];
            allRecipes.push(recipe);
            localStorage.setItem("recipes", JSON.stringify(allRecipes));
            return recipe;
        });

        return newRecipe;
    }

    public async generateRepiceWithOpenAI(
        generationParameters: RecipeGenerationParametersInterface,
        email: string,
        token: string
    ): Promise<RecipeInterface | null> {
        const response = await BackendService.fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email,
            },
            body: JSON.stringify(generationParameters),
        });

        if (!response.ok) {
            if (response.status == 403) {
                redirect('/premium');
                return null;
            }

            if (response.status === 402) {
                const problem = await response.json().catch(() => ({}));
                throw { type: "INSUFFICIENT_CREDITS", detail: problem };
            }

            throw new Error('Erreur lors de la mise à jour');
        }

        const recipe: Promise<RecipeInterface> = response.json();

        const allRecipes: RecipeInterface[] = localStorage.getItem("recipes") ? JSON.parse(localStorage.getItem("recipes") as string) : [];
        recipe.then((recipe) => {
            allRecipes.push(recipe);
            localStorage.setItem("recipes", JSON.stringify(allRecipes));
        });

        return recipe;
    }

    public static async deleteRecipe(
        email: string,
        token: string,
        recipeUuid: string
    ): Promise<void> {
        const response = await this.fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/delete/${recipeUuid}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email,
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour');
        }

        this.getPersonalRecipes(email, token).then((recipes) => {
            localStorage.setItem("recipes", JSON.stringify(recipes));
        });
    }

    public static async updateRecipe(
        email: string,
        token: string,
        recipe: RecipeInterface
    ): Promise<RecipeInterface> {
        const response = await this.fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email,
            },
            body: JSON.stringify(recipe),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour');
        }

        const updatedRecipe: Promise<RecipeInterface> = response.json();

        const allRecipes: RecipeInterface[] = localStorage.getItem("recipes") ? JSON.parse(localStorage.getItem("recipes") as string) : [];
        updatedRecipe.then((recipe) => {
            const index = allRecipes.findIndex((r) => r.uuid === recipe.uuid);
            allRecipes[index] = recipe;
            localStorage.setItem("recipes", JSON.stringify(allRecipes));
        });

        return updatedRecipe;
    }

    public static async getUserCredits(
        email: string,
        token: string
    ): Promise<number> {
        const response = await this.fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/credits`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des crédits');
        }

        return response.json();
    }

}
