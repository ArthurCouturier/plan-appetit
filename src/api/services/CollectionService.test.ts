import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import CollectionService from './CollectionService';

describe('CollectionService', () => {
    const mockEmail = 'test@example.com';
    const mockToken = 'fake-token-123';
    const mockBaseUrl = 'http://localhost';
    const mockPort = '8080';

    beforeEach(() => {
        vi.clearAllMocks();
        (global.fetch as any) = vi.fn();

        vi.stubEnv('VITE_API_URL', mockBaseUrl);
        vi.stubEnv('VITE_API_PORT', mockPort);

        localStorage.setItem('email', mockEmail);
        localStorage.setItem('firebaseIdToken', mockToken);
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('createCollection', () => {
        it('devrait cr\u00e9er une collection avec succ\u00e8s', async () => {
            const mockCollection = {
                uuid: 'collection-123',
                name: 'Nouvelle Collection',
                isPublic: false,
                level: 1,
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockCollection,
            } as Response);

            const result = await CollectionService.createCollection('Nouvelle Collection', false);

            expect(result).toEqual(mockCollection);
            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/collections/create`,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${mockToken}`,
                        'Email': mockEmail,
                    }),
                    body: JSON.stringify({
                        name: 'Nouvelle Collection',
                        isPublic: false,
                        parentCollectionUuid: null,
                    }),
                })
            );
        });

        it('devrait cr\u00e9er une sous-collection avec parent', async () => {
            const parentUuid = 'parent-uuid-123';
            const mockCollection = {
                uuid: 'collection-456',
                name: 'Sous-collection',
                isPublic: true,
                level: 2,
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockCollection,
            } as Response);

            const result = await CollectionService.createCollection('Sous-collection', true, parentUuid);

            expect(result).toEqual(mockCollection);
            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({
                        name: 'Sous-collection',
                        isPublic: true,
                        parentCollectionUuid: parentUuid,
                    }),
                })
            );
        });

        it('devrait throw une erreur si non connect\u00e9', async () => {
            localStorage.clear();

            await expect(
                CollectionService.createCollection('Test', false)
            ).rejects.toThrow('User not logged in');
        });

        it('devrait throw une erreur si la r\u00e9ponse n\'est pas ok', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                statusText: 'Bad Request',
            } as Response);

            await expect(
                CollectionService.createCollection('Test', false)
            ).rejects.toThrow('Failed to create collection');
        });
    });

    describe('getCollectionById', () => {
        it('devrait r\u00e9cup\u00e9rer une collection par UUID', async () => {
            const mockCollection = {
                uuid: 'collection-123',
                name: 'Ma Collection',
                recipes: [],
                subCollections: [],
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockCollection,
            } as Response);

            const result = await CollectionService.getCollectionById('collection-123');

            expect(result).toEqual(mockCollection);
            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/collections/collection-123`,
                expect.objectContaining({
                    method: 'GET',
                })
            );
        });

        it('devrait retourner null si collection non trouv\u00e9e', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 404,
            } as Response);

            const result = await CollectionService.getCollectionById('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('getDefaultCollection', () => {
        it('devrait r\u00e9cup\u00e9rer la collection par d\u00e9faut', async () => {
            const mockDefaultCollection = {
                uuid: 'default-123',
                name: 'Toutes mes recettes',
                level: 0,
                isDefault: true,
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockDefaultCollection,
            } as Response);

            const result = await CollectionService.getDefaultCollection();

            expect(result).toEqual(mockDefaultCollection);
            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/collections/default`,
                expect.any(Object)
            );
        });
    });

    describe('deleteCollection', () => {
        it('devrait supprimer une collection', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
            } as Response);

            await CollectionService.deleteCollection('collection-123');

            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/collections/collection-123`,
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
        });

        it('devrait throw une erreur si la suppression \u00e9choue', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                statusText: 'Forbidden',
            } as Response);

            await expect(
                CollectionService.deleteCollection('default-collection')
            ).rejects.toThrow('Failed to delete collection');
        });
    });

    describe('reorderCollectionItems', () => {
        it('devrait r\u00e9ordonner les recettes', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
            } as Response);

            const recipeOrders = [
                { uuid: 'recipe-1', displayOrder: 0 },
                { uuid: 'recipe-2', displayOrder: 1 },
            ];

            await CollectionService.reorderCollectionItems('collection-123', recipeOrders, undefined);

            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/collections/collection-123/reorder`,
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify({
                        recipeOrders: recipeOrders,
                        subCollectionOrders: null,
                    }),
                })
            );
        });

        it('devrait r\u00e9ordonner les sous-collections', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
            } as Response);

            const subCollectionOrders = [
                { uuid: 'sub-1', displayOrder: 0 },
                { uuid: 'sub-2', displayOrder: 1 },
            ];

            await CollectionService.reorderCollectionItems('collection-123', undefined, subCollectionOrders);

            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/collections/collection-123/reorder`,
                expect.objectContaining({
                    method: 'PATCH',
                    body: JSON.stringify({
                        recipeOrders: null,
                        subCollectionOrders: subCollectionOrders,
                    }),
                })
            );
        });

        it('devrait throw une erreur si le r\u00e9ordonnancement \u00e9choue', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                statusText: 'Bad Request',
            } as Response);

            await expect(
                CollectionService.reorderCollectionItems('collection-123', [], undefined)
            ).rejects.toThrow('Failed to reorder collection items');
        });
    });

    describe('moveRecipeToCollection', () => {
        it('devrait d\u00e9placer une recette vers une autre collection', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
            } as Response);

            await CollectionService.moveRecipeToCollection(
                'recipe-123',
                'source-collection',
                'target-collection'
            );

            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/collections/target-collection/recipes/move`,
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        recipeUuid: 'recipe-123',
                        sourceCollectionUuid: 'source-collection',
                        targetDisplayOrder: null,
                    }),
                })
            );
        });

        it('devrait d\u00e9placer une recette avec un ordre sp\u00e9cifique', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
            } as Response);

            await CollectionService.moveRecipeToCollection(
                'recipe-123',
                'source-collection',
                'target-collection',
                5
            );

            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({
                        recipeUuid: 'recipe-123',
                        sourceCollectionUuid: 'source-collection',
                        targetDisplayOrder: 5,
                    }),
                })
            );
        });

        it('devrait throw une erreur si le d\u00e9placement \u00e9choue', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                statusText: 'Forbidden',
            } as Response);

            await expect(
                CollectionService.moveRecipeToCollection('recipe-123', 'source', 'target')
            ).rejects.toThrow('Failed to move recipe to collection');
        });
    });

    describe('moveCollectionToParent', () => {
        it('devrait d\u00e9placer une collection vers un nouveau parent', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
            } as Response);

            await CollectionService.moveCollectionToParent('collection-123', 'new-parent-uuid');

            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/collections/collection-123/move`,
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({
                        newParentUuid: 'new-parent-uuid',
                    }),
                })
            );
        });

        it('devrait throw une erreur si le d\u00e9placement \u00e9choue', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                statusText: 'Bad Request',
            } as Response);

            await expect(
                CollectionService.moveCollectionToParent('collection-123', 'invalid-parent')
            ).rejects.toThrow('Failed to move collection');
        });
    });

    describe('addRecipeToCollection', () => {
        it('devrait ajouter une recette \u00e0 une collection', async () => {
            const mockCollection = {
                uuid: 'collection-123',
                name: 'Ma Collection',
                recipes: [{ uuid: 'recipe-123' }],
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockCollection,
            } as Response);

            const result = await CollectionService.addRecipeToCollection('collection-123', 'recipe-123');

            expect(result).toEqual(mockCollection);
            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/collections/collection-123/recipes`,
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ recipeUuid: 'recipe-123' }),
                })
            );
        });
    });

    describe('removeRecipeFromCollection', () => {
        it('devrait retirer une recette d\'une collection', async () => {
            const mockCollection = {
                uuid: 'collection-123',
                name: 'Ma Collection',
                recipes: [],
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockCollection,
            } as Response);

            const result = await CollectionService.removeRecipeFromCollection('collection-123', 'recipe-123');

            expect(result).toEqual(mockCollection);
            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/collections/collection-123/recipes/recipe-123`,
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
        });
    });

    describe('getRootCollections', () => {
        it('devrait r\u00e9cup\u00e9rer les collections racine', async () => {
            const mockCollections = [
                { uuid: 'root-1', name: 'Collection 1' },
                { uuid: 'root-2', name: 'Collection 2' },
            ];

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockCollections,
            } as Response);

            const result = await CollectionService.getRootCollections();

            expect(result).toEqual(mockCollections);
            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/collections/root`,
                expect.any(Object)
            );
        });
    });
});
