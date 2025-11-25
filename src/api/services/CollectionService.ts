import BackendService from "./BackendService";
import RecipeCollectionInterface from "../interfaces/collections/RecipeCollectionInterface";
import CollectionBasicInfoInterface from "../interfaces/collections/CollectionBasicInfoInterface";
import CreateCollectionRequest from "../interfaces/collections/CreateCollectionRequest";
import { fetchWithTokenRefresh } from "../utils/fetchWithTokenRefresh";

export default class CollectionService {

    static async createCollection(
        name: string,
        isPublic: boolean,
        parentCollectionUuid?: string | null
    ): Promise<RecipeCollectionInterface> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const request: CreateCollectionRequest = {
            name,
            isPublic,
            parentCollectionUuid: parentCollectionUuid || null
        };

        const response = await fetchWithTokenRefresh(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Email': email,
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`Failed to create collection: ${response.statusText}`);
        }

        return await response.json();
    }

    static async getAllCollections(): Promise<RecipeCollectionInterface[]> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetchWithTokenRefresh(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/all`, {
            method: 'GET',
            headers: {
                'Email': email,
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch collections: ${response.statusText}`);
        }

        return await response.json();
    }

    static async getDefaultCollection(): Promise<CollectionBasicInfoInterface> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetchWithTokenRefresh(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/default`, {
            method: 'GET',
            headers: {
                'Email': email,
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch default collection: ${response.statusText}`);
        }

        return await response.json();
    }

    static async getRootCollections(): Promise<RecipeCollectionInterface[]> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetchWithTokenRefresh(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/root`, {
            method: 'GET',
            headers: {
                'Email': email,
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch root collections: ${response.statusText}`);
        }

        return await response.json();
    }

    static async getCollectionById(uuid: string): Promise<RecipeCollectionInterface | null> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetchWithTokenRefresh(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/${uuid}`, {
            method: 'GET',
            headers: {
                'Email': email,
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch collection: ${response.statusText}`);
        }

        return await response.json();
    }

    static async deleteCollection(uuid: string): Promise<void> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetchWithTokenRefresh(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/${uuid}`, {
            method: 'DELETE',
            headers: {
                'Email': email,
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete collection: ${response.statusText}`);
        }
    }

    static async addRecipeToCollection(collectionUuid: string, recipeUuid: string): Promise<RecipeCollectionInterface> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetchWithTokenRefresh(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/${collectionUuid}/recipes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Email': email,
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ recipeUuid }),
        });

        if (!response.ok) {
            throw new Error(`Failed to add recipe to collection: ${response.statusText}`);
        }

        return await response.json();
    }

    static async removeRecipeFromCollection(collectionUuid: string, recipeUuid: string): Promise<RecipeCollectionInterface> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetchWithTokenRefresh(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/${collectionUuid}/recipes/${recipeUuid}`, {
            method: 'DELETE',
            headers: {
                'Email': email,
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to remove recipe from collection: ${response.statusText}`);
        }

        return await response.json();
    }

    static async reorderCollectionItems(
        collectionUuid: string,
        recipeOrders?: Array<{ uuid: string; displayOrder: number }>,
        subCollectionOrders?: Array<{ uuid: string; displayOrder: number }>
    ): Promise<void> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetchWithTokenRefresh(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/${collectionUuid}/reorder`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Email': email,
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                recipeOrders: recipeOrders || null,
                subCollectionOrders: subCollectionOrders || null,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to reorder collection items: ${response.statusText}`);
        }
    }

    static async moveRecipeToCollection(
        recipeUuid: string,
        sourceCollectionUuid: string,
        targetCollectionUuid: string,
        targetDisplayOrder?: number
    ): Promise<void> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetchWithTokenRefresh(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/${targetCollectionUuid}/recipes/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Email': email,
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                recipeUuid,
                sourceCollectionUuid,
                targetDisplayOrder: targetDisplayOrder ?? null,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to move recipe to collection: ${response.statusText}`);
        }
    }

    static async moveCollectionToParent(
        collectionUuid: string,
        newParentCollectionUuid: string
    ): Promise<void> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetchWithTokenRefresh(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/${collectionUuid}/move`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Email': email,
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                newParentUuid: newParentCollectionUuid,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to move collection: ${response.statusText}`);
        }
    }

    static async updateCollection(
        collectionUuid: string,
        updates: { name?: string; isPublic?: boolean }
    ): Promise<void> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetchWithTokenRefresh(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/${collectionUuid}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Email': email,
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error(`Failed to update collection: ${response.statusText}`);
        }
    }
}
