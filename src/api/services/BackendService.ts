import { redirect } from "react-router-dom";
import RecipeGenerationParametersInterface from "../interfaces/recipes/RecipeGenerationParametersInterface";
import RecipeInterface from "../interfaces/recipes/RecipeInterface";
import UserInterface from "../interfaces/users/UserInterface";
import UserAccountInfoInterface from "../interfaces/users/UserAccountInfoInterface";
import StatisticsInterface from "../interfaces/users/StatisticsInterface";
import SuccessInterface, { SuccessClaimResponse } from "../interfaces/users/SuccessInterface";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export default class BackendService {
    static baseUrl: string = import.meta.env.VITE_API_URL;
    static port: string = import.meta.env.VITE_API_PORT;

    public static async registerNewUser(user: UserInterface, token: string): Promise<UserInterface> {
        console.log("token", token)
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/register`, {
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

    public static async getRecipeByUuid(
        uuid: string,
        email: string,
        token: string
    ): Promise<RecipeInterface | null> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/${uuid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email,
            },
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération de la recette');
        }

        return response.json();
    }

    public static async createNewEmptyRecipe(
        email: string,
        token: string
    ): Promise<RecipeInterface> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email,
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la création de la recette');
        }

        return response.json();
    }

    public static async importRecipeFromLocalFile(
        recipe: RecipeInterface,
        email: string,
        token: string
    ): Promise<RecipeInterface> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/import`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email,
            },
            body: JSON.stringify(recipe),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'import de la recette');
        }

        return response.json();
    }

    public static async generateRecipeWithOpenAI(
        generationParameters: RecipeGenerationParametersInterface,
        email: string,
        token: string
    ): Promise<RecipeInterface | null> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/generate`, {
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

            throw new Error('Erreur lors de la génération de la recette');
        }

        return response.json();
    }

    public static async deleteRecipe(
        email: string,
        token: string,
        recipeUuid: string
    ): Promise<void> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/delete/${recipeUuid}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email,
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de la recette');
        }
    }

    public static async updateRecipe(
        email: string,
        token: string,
        recipe: RecipeInterface
    ): Promise<RecipeInterface> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email,
            },
            body: JSON.stringify(recipe),
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la mise à jour de la recette');
        }

        return response.json();
    }

    public static async getUserCredits(
        email: string,
        token: string
    ): Promise<number> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/credits`, {
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

    public static async getAccountInfo(
        email: string,
        token: string
    ): Promise<UserAccountInfoInterface> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/account-info`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des informations du compte');
        }

        return response.json();
    }

    public static async connectUser(
        email: string,
        token: string
    ): Promise<UserInterface> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/connect`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la connexion utilisateur');
        }

        return response.json();
    }

    public static async getUserStatistics(
        email: string,
        token: string
    ): Promise<StatisticsInterface> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/statistics`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des statistiques');
        }

        return response.json();
    }

    public static async getUserSuccess(
        email: string,
        token: string
    ): Promise<SuccessInterface> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/success`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des succès');
        }

        return response.json();
    }

    public static async claimSuccessReward(
        email: string,
        token: string,
        successType: string
    ): Promise<SuccessClaimResponse> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/success/claim/${successType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
        });

        if (!response.ok && response.status !== 400) {
            throw new Error('Erreur lors de la réclamation du succès');
        }

        return response.json();
    }

    public static async trackRecipeExport(
        email: string,
        token: string
    ): Promise<{ success: boolean }> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/users/track-export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
        });

        if (!response.ok) {
            throw new Error('Erreur lors du tracking de l\'export');
        }

        return response.json();
    }

    public static async modifyRecipe(
        email: string,
        token: string,
        recipeUuid: string,
        prompt: string
    ): Promise<RecipeInterface> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/${recipeUuid}/modifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
            body: JSON.stringify({ prompt }),
        });

        if (response.status === 402) {
            throw { type: "INSUFFICIENT_MODIFICATION_CREDITS" };
        }

        if (response.status === 403) {
            throw { type: "FORBIDDEN" };
        }

        if (response.status === 404) {
            throw { type: "NOT_FOUND" };
        }

        if (!response.ok) {
            throw new Error('Erreur lors de la modification de la recette');
        }

        return response.json();
    }

    public static async purchaseModificationCredits(
        email: string,
        token: string,
        recipeUuid: string
    ): Promise<RecipeInterface> {
        const response = await fetchWithTokenRefresh(`${this.baseUrl}:${this.port}/api/v1/recipes/${recipeUuid}/modifications/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Email': email
            },
        });

        if (response.status === 402) {
            throw { type: "INSUFFICIENT_CREDITS" };
        }

        if (response.status === 403) {
            throw { type: "FORBIDDEN" };
        }

        if (response.status === 404) {
            throw { type: "NOT_FOUND" };
        }

        if (!response.ok) {
            throw new Error('Erreur lors de l\'achat des crédits de modification');
        }

        return response.json();
    }

}
