import { describe, it, expect, beforeEach, vi } from 'vitest';
import UserStatsService from './UserStatsService';
import BackendService from './BackendService';
import { SuccessType } from '../interfaces/users/SuccessInterface';

vi.mock('./BackendService');

describe('UserStatsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('fetchStatistics', () => {
        it('devrait récupérer les statistiques avec succès', async () => {
            const mockStats = {
                uuid: 'stats-123',
                totalGeneratedRecipes: 5,
                localisationRecipes: 2,
                multiRecipes: 1,
                batchCookingRecipes: 0,
                instagramRecipes: 0,
                importedRecipes: 1,
                exportedRecipes: 3,
                createdAt: '2025-10-25T00:00:00Z',
                updatedAt: '2025-10-25T00:00:00Z',
            };

            localStorage.setItem('email', 'test@example.com');
            localStorage.setItem('firebaseIdToken', 'fake-token');

            vi.mocked(BackendService.getUserStatistics).mockResolvedValue(mockStats);

            const result = await UserStatsService.fetchStatistics();

            expect(result).toEqual(mockStats);
            expect(BackendService.getUserStatistics).toHaveBeenCalledWith(
                'test@example.com',
                'fake-token'
            );
        });

        it('devrait throw une erreur si l\'utilisateur n\'est pas authentifié (email manquant)', async () => {
            localStorage.setItem('firebaseIdToken', 'fake-token');

            await expect(UserStatsService.fetchStatistics()).rejects.toThrow(
                'User not authenticated'
            );
        });

        it('devrait throw une erreur si l\'utilisateur n\'est pas authentifié (token manquant)', async () => {
            localStorage.setItem('email', 'test@example.com');

            await expect(UserStatsService.fetchStatistics()).rejects.toThrow(
                'User not authenticated'
            );
        });
    });

    describe('fetchSuccess', () => {
        it('devrait récupérer les succès avec succès', async () => {
            const mockSuccess = {
                uuid: 'success-123',
                generateOneRecipe: true,
                generateOneLocationRecipe: false,
                generateOneMultiRecipe: false,
                exportOneRecipe: true,
                generateOneBatchCooking: false,
                generateTenRecipes: false,
                generateHundredRecipes: false,
                generateOneRecipeAt: '2025-10-25T00:00:00Z',
                generateOneLocationRecipeAt: null,
                generateOneMultiRecipeAt: null,
                exportOneRecipeAt: '2025-10-25T00:00:00Z',
                generateOneBatchCookingAt: null,
                generateTenRecipesAt: null,
                generateHundredRecipesAt: null,
                totalCreditsEarned: 2,
                createdAt: '2025-10-25T00:00:00Z',
                updatedAt: '2025-10-25T00:00:00Z',
            };

            localStorage.setItem('email', 'test@example.com');
            localStorage.setItem('firebaseIdToken', 'fake-token');

            vi.mocked(BackendService.getUserSuccess).mockResolvedValue(mockSuccess);

            const result = await UserStatsService.fetchSuccess();

            expect(result).toEqual(mockSuccess);
            expect(BackendService.getUserSuccess).toHaveBeenCalledWith(
                'test@example.com',
                'fake-token'
            );
        });

        it('devrait throw une erreur si l\'utilisateur n\'est pas authentifié', async () => {
            await expect(UserStatsService.fetchSuccess()).rejects.toThrow(
                'User not authenticated'
            );
        });
    });

    describe('claimSuccessReward', () => {
        it('devrait réclamer une récompense avec succès', async () => {
            const mockResponse = {
                success: true,
                message: 'Succès réclamé',
                creditsAwarded: 1,
                alreadyClaimed: false,
                totalCreditsEarned: 3,
            };

            localStorage.setItem('email', 'test@example.com');
            localStorage.setItem('firebaseIdToken', 'fake-token');

            vi.mocked(BackendService.claimSuccessReward).mockResolvedValue(mockResponse);

            const result = await UserStatsService.claimSuccessReward(
                SuccessType.GENERATE_ONE_RECIPE
            );

            expect(result).toEqual(mockResponse);
            expect(BackendService.claimSuccessReward).toHaveBeenCalledWith(
                'test@example.com',
                'fake-token',
                SuccessType.GENERATE_ONE_RECIPE
            );
        });

        it('devrait throw une erreur si l\'utilisateur n\'est pas authentifié', async () => {
            await expect(
                UserStatsService.claimSuccessReward(SuccessType.GENERATE_ONE_RECIPE)
            ).rejects.toThrow('User not authenticated');
        });

        it('devrait gérer le cas où le succès a déjà été réclamé', async () => {
            const mockResponse = {
                success: false,
                message: 'Succès déjà réclamé',
                creditsAwarded: 0,
                alreadyClaimed: true,
                totalCreditsEarned: 2,
            };

            localStorage.setItem('email', 'test@example.com');
            localStorage.setItem('firebaseIdToken', 'fake-token');

            vi.mocked(BackendService.claimSuccessReward).mockResolvedValue(mockResponse);

            const result = await UserStatsService.claimSuccessReward(
                SuccessType.GENERATE_ONE_RECIPE
            );

            expect(result.success).toBe(false);
            expect(result.alreadyClaimed).toBe(true);
        });
    });
});
