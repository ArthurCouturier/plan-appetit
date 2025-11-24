import BackendService from "./BackendService";
import RecipeCollectionInterface from "../interfaces/collections/RecipeCollectionInterface";
import CreateCollectionRequest from "../interfaces/collections/CreateCollectionRequest";

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

        const response = await fetch(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/create`, {
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

        const response = await fetch(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/all`, {
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

    static async getDefaultCollection(): Promise<RecipeCollectionInterface> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetch(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/default`, {
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

        const response = await fetch(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/root`, {
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

    static async deleteCollection(uuid: string): Promise<void> {
        const email: string = localStorage.getItem('email') as string;
        const token: string = localStorage.getItem('firebaseIdToken') as string;

        if (!email || !token) {
            throw new Error('User not logged in');
        }

        const response = await fetch(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/${uuid}`, {
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

        const response = await fetch(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/${collectionUuid}/recipes`, {
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

        const response = await fetch(`${BackendService.baseUrl}:${BackendService.port}/api/v1/collections/${collectionUuid}/recipes/${recipeUuid}`, {
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
}
