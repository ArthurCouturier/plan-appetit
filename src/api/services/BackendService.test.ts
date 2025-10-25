import { describe, it, expect, beforeEach, vi } from 'vitest';
import BackendService from './BackendService';

describe('BackendService - Statistics and Success', () => {
    const mockEmail = 'test@example.com';
    const mockToken = 'fake-token-123';
    const mockBaseUrl = 'http://localhost';
    const mockPort = '8080';

    beforeEach(() => {
        vi.clearAllMocks();
        (global.fetch as any) = vi.fn();

        // Mock des variables d'environnement
        vi.stubEnv('VITE_API_URL', mockBaseUrl);
        vi.stubEnv('VITE_API_PORT', mockPort);
    });

    describe('getUserStatistics', () => {
        it('devrait récupérer les statistiques utilisateur', async () => {
            const mockStats = {
                uuid: 'stats-123',
                totalGeneratedRecipes: 10,
                localisationRecipes: 5,
                multiRecipes: 2,
                batchCookingRecipes: 1,
                instagramRecipes: 0,
                importedRecipes: 3,
                exportedRecipes: 4,
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockStats,
            } as Response);

            const result = await BackendService.getUserStatistics(mockEmail, mockToken);

            expect(result).toEqual(mockStats);
            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/users/statistics`,
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${mockToken}`,
                        'Email': mockEmail,
                    }),
                })
            );
        });

        it('devrait throw une erreur si la réponse n\'est pas ok', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({}),
            } as Response);

            await expect(
                BackendService.getUserStatistics(mockEmail, mockToken)
            ).rejects.toThrow('Erreur lors de la récupération des statistiques');
        });
    });

    describe('getUserSuccess', () => {
        it('devrait récupérer les succès utilisateur', async () => {
            const mockSuccess = {
                uuid: 'success-123',
                generateOneRecipe: true,
                generateOneLocationRecipe: true,
                generateOneMultiRecipe: false,
                exportOneRecipe: true,
                totalCreditsEarned: 3,
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockSuccess,
            } as Response);

            const result = await BackendService.getUserSuccess(mockEmail, mockToken);

            expect(result).toEqual(mockSuccess);
            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/users/success`,
                expect.objectContaining({
                    method: 'GET',
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`,
                        'Email': mockEmail,
                    }),
                })
            );
        });

        it('devrait throw une erreur si la réponse n\'est pas ok', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({}),
            } as Response);

            await expect(
                BackendService.getUserSuccess(mockEmail, mockToken)
            ).rejects.toThrow('Erreur lors de la récupération des succès');
        });
    });

    describe('claimSuccessReward', () => {
        it('devrait réclamer une récompense avec succès', async () => {
            const mockResponse = {
                success: true,
                message: 'Succès réclamé',
                creditsAwarded: 1,
                alreadyClaimed: false,
                totalCreditsEarned: 4,
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await BackendService.claimSuccessReward(
                mockEmail,
                mockToken,
                'GENERATE_ONE_RECIPE'
            );

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/users/success/claim/GENERATE_ONE_RECIPE`,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`,
                        'Email': mockEmail,
                    }),
                })
            );
        });

        it('devrait gérer une erreur 400 (déjà réclamé)', async () => {
            const mockResponse = {
                success: false,
                message: 'Succès déjà réclamé',
                creditsAwarded: 0,
                alreadyClaimed: true,
                totalCreditsEarned: 3,
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => mockResponse,
            } as Response);

            const result = await BackendService.claimSuccessReward(
                mockEmail,
                mockToken,
                'GENERATE_ONE_RECIPE'
            );

            expect(result).toEqual(mockResponse);
        });

        it('devrait throw une erreur pour les statuts != 400', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 500,
            } as Response);

            await expect(
                BackendService.claimSuccessReward(mockEmail, mockToken, 'INVALID')
            ).rejects.toThrow('Erreur lors de la réclamation du succès');
        });
    });

    describe('trackRecipeExport', () => {
        it('devrait tracker l\'export d\'une recette', async () => {
            const mockResponse = { success: true };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await BackendService.trackRecipeExport(mockEmail, mockToken);

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                `${mockBaseUrl}:${mockPort}/api/v1/users/track-export`,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${mockToken}`,
                        'Email': mockEmail,
                    }),
                })
            );
        });

        it('devrait throw une erreur si la réponse n\'est pas ok', async () => {
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: async () => ({}),
            } as Response);

            await expect(
                BackendService.trackRecipeExport(mockEmail, mockToken)
            ).rejects.toThrow('Erreur lors du tracking de l\'export');
        });
    });
});
