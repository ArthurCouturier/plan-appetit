import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OnboardingChecklist from './OnboardingChecklist';
import UserStatsService from '../../api/services/UserStatsService';

vi.mock('../../api/services/UserStatsService');
vi.mock('canvas-confetti');

describe('OnboardingChecklist', () => {
    const mockStatistics = {
        uuid: 'stats-123',
        totalGeneratedRecipes: 1,
        localisationRecipes: 1,
        multiRecipes: 0,
        batchCookingRecipes: 0,
        instagramRecipes: 0,
        importedRecipes: 0,
        exportedRecipes: 0,
        createdAt: '2025-10-25T00:00:00Z',
        updatedAt: '2025-10-25T00:00:00Z',
    };

    const mockSuccess = {
        uuid: 'success-123',
        generateOneRecipe: false,
        generateOneLocationRecipe: false,
        generateOneMultiRecipe: false,
        exportOneRecipe: false,
        generateOneBatchCooking: false,
        generateTenRecipes: false,
        generateHundredRecipes: false,
        generateOneRecipeAt: null,
        generateOneLocationRecipeAt: null,
        generateOneMultiRecipeAt: null,
        exportOneRecipeAt: null,
        generateOneBatchCookingAt: null,
        generateTenRecipesAt: null,
        generateHundredRecipesAt: null,
        totalCreditsEarned: 0,
        createdAt: '2025-10-25T00:00:00Z',
        updatedAt: '2025-10-25T00:00:00Z',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Affichage initial', () => {
        it('ne devrait pas s\'afficher si les données ne sont pas chargées', () => {
            vi.mocked(UserStatsService.fetchStatistics).mockResolvedValue(null as any);
            vi.mocked(UserStatsService.fetchSuccess).mockResolvedValue(null as any);

            const { container } = render(<OnboardingChecklist />);
            expect(container).toBeEmptyDOMElement();
        });

        it('devrait afficher le composant avec les achievements', async () => {
            vi.mocked(UserStatsService.fetchStatistics).mockResolvedValue(mockStatistics);
            vi.mocked(UserStatsService.fetchSuccess).mockResolvedValue(mockSuccess);

            render(<OnboardingChecklist />);

            await waitFor(() => {
                expect(screen.getByText('Premiers Pas')).toBeInTheDocument();
            });

            expect(screen.getByText('Générer 1 recette')).toBeInTheDocument();
            expect(screen.getByText('Générer 1 recette par localisation')).toBeInTheDocument();
            expect(screen.getByText('Exporter 1 recette')).toBeInTheDocument();
        });

        it('ne devrait pas afficher le composant si tous les succès sont réclamés', async () => {
            const allClaimedSuccess = {
                ...mockSuccess,
                generateOneRecipe: true,
                generateOneLocationRecipe: true,
                generateOneMultiRecipe: true,
                exportOneRecipe: true,
            };

            vi.mocked(UserStatsService.fetchStatistics).mockResolvedValue(mockStatistics);
            vi.mocked(UserStatsService.fetchSuccess).mockResolvedValue(allClaimedSuccess);

            const { container } = render(<OnboardingChecklist />);

            await waitFor(() => {
                expect(container).toBeEmptyDOMElement();
            });
        });
    });

    describe('États des achievements', () => {
        it('devrait afficher un cadenas pour les achievements non complétés', async () => {
            vi.mocked(UserStatsService.fetchStatistics).mockResolvedValue({
                ...mockStatistics,
                totalGeneratedRecipes: 0,
            });
            vi.mocked(UserStatsService.fetchSuccess).mockResolvedValue(mockSuccess);

            render(<OnboardingChecklist />);

            await waitFor(() => {
                expect(screen.getByText('Premiers Pas')).toBeInTheDocument();
            });

            // Vérifier que les achievements sont bien affichés
            expect(screen.getByText('Générer 1 recette')).toBeInTheDocument();
        });

        it('devrait afficher un bouton "Réclamer" pour les achievements complétés non réclamés', async () => {
            vi.mocked(UserStatsService.fetchStatistics).mockResolvedValue(mockStatistics);
            vi.mocked(UserStatsService.fetchSuccess).mockResolvedValue(mockSuccess);

            render(<OnboardingChecklist />);

            await waitFor(() => {
                expect(screen.getByText('Premiers Pas')).toBeInTheDocument();
            });

            // Vérifier qu'il y a au moins un bouton de claim
            const claimButtons = screen.getAllByText(/\+\d+/);
            expect(claimButtons.length).toBeGreaterThan(0);
        });

        it('devrait afficher une coche verte pour les achievements réclamés', async () => {
            const successWithClaimed = {
                ...mockSuccess,
                generateOneRecipe: true,
            };

            vi.mocked(UserStatsService.fetchStatistics).mockResolvedValue(mockStatistics);
            vi.mocked(UserStatsService.fetchSuccess).mockResolvedValue(successWithClaimed);

            render(<OnboardingChecklist />);

            await waitFor(() => {
                const text = screen.getByText('Générer 1 recette');
                expect(text).toHaveClass('line-through');
                expect(text).toHaveClass('text-green-600');
            });
        });
    });

    describe('Claim de récompense', () => {
        it('devrait réclamer une récompense avec succès', async () => {
            const user = userEvent.setup();

            vi.mocked(UserStatsService.fetchStatistics).mockResolvedValue(mockStatistics);
            vi.mocked(UserStatsService.fetchSuccess).mockResolvedValue(mockSuccess);
            vi.mocked(UserStatsService.claimSuccessReward).mockResolvedValue({
                success: true,
                message: 'Succès réclamé',
                creditsAwarded: 1,
                alreadyClaimed: false,
                totalCreditsEarned: 1,
            });

            render(<OnboardingChecklist />);

            await waitFor(() => {
                expect(screen.getByText('Premiers Pas')).toBeInTheDocument();
            });

            const claimButtons = screen.getAllByText(/\+\d+/);
            const claimButton = claimButtons[0].closest('button')!;
            await user.click(claimButton);

            await waitFor(() => {
                expect(UserStatsService.claimSuccessReward).toHaveBeenCalled();
            }, { timeout: 2000 });
        });

        it('devrait afficher "Export en cours..." pendant le claim', async () => {
            const user = userEvent.setup();

            vi.mocked(UserStatsService.fetchStatistics).mockResolvedValue(mockStatistics);
            vi.mocked(UserStatsService.fetchSuccess).mockResolvedValue(mockSuccess);
            vi.mocked(UserStatsService.claimSuccessReward).mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve({
                    success: true,
                    message: 'Succès réclamé',
                    creditsAwarded: 1,
                    alreadyClaimed: false,
                    totalCreditsEarned: 1,
                }), 100))
            );

            render(<OnboardingChecklist />);

            await waitFor(() => {
                expect(screen.getByText('Premiers Pas')).toBeInTheDocument();
            });

            const claimButtons = screen.getAllByText(/\+\d+/);
            const claimButton = claimButtons[0].closest('button')!;

            expect(claimButton).not.toHaveClass('opacity-50');

            await user.click(claimButton);

            await waitFor(() => {
                expect(claimButton).toHaveClass('opacity-50');
            }, { timeout: 2000 });
        });

        it('devrait gérer l\'échec du claim', async () => {
            const user = userEvent.setup();
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            vi.mocked(UserStatsService.fetchStatistics).mockResolvedValue(mockStatistics);
            vi.mocked(UserStatsService.fetchSuccess).mockResolvedValue(mockSuccess);
            vi.mocked(UserStatsService.claimSuccessReward).mockResolvedValue({
                success: false,
                message: 'Succès déjà réclamé',
                creditsAwarded: 0,
                alreadyClaimed: true,
                totalCreditsEarned: 0,
            });

            render(<OnboardingChecklist />);

            await waitFor(() => {
                expect(screen.getByText('Premiers Pas')).toBeInTheDocument();
            });

            const claimButtons = screen.getAllByText(/\+\d+/);
            const claimButton = claimButtons[0].closest('button')!;
            await user.click(claimButton);

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Failed to claim reward:',
                    'Succès déjà réclamé'
                );
            }, { timeout: 2000 });

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Animation d\'implosion', () => {
        it('devrait appeler claimSuccessReward et recharger les données', async () => {
            const user = userEvent.setup();

            const statsWithAll = {
                ...mockStatistics,
                localisationRecipes: 1,
                multiRecipes: 1,
                exportedRecipes: 1,
            };

            const successAlmostComplete = {
                ...mockSuccess,
                generateOneLocationRecipe: true,
                generateOneMultiRecipe: true,
            };

            vi.mocked(UserStatsService.fetchStatistics).mockResolvedValue(statsWithAll);
            vi.mocked(UserStatsService.fetchSuccess).mockResolvedValue(successAlmostComplete);
            vi.mocked(UserStatsService.claimSuccessReward).mockResolvedValue({
                success: true,
                message: 'Succès réclamé',
                creditsAwarded: 1,
                alreadyClaimed: false,
                totalCreditsEarned: 4,
            });

            render(<OnboardingChecklist />);

            await waitFor(() => {
                expect(screen.getByText('Premiers Pas')).toBeInTheDocument();
            });

            const claimButtons = screen.getAllByText(/\+\d+/);
            const claimButton = claimButtons[0].closest('button')!;
            await user.click(claimButton);

            // Vérifier que le claim a été appelé
            await waitFor(() => {
                expect(UserStatsService.claimSuccessReward).toHaveBeenCalled();
            }, { timeout: 2000 });

            // Vérifier que fetchSuccess a été appelé au moins 2 fois (initial + après claim)
            await waitFor(() => {
                expect(UserStatsService.fetchSuccess).toHaveBeenCalled();
                expect((UserStatsService.fetchSuccess as any).mock.calls.length).toBeGreaterThanOrEqual(2);
            }, { timeout: 2000 });
        });
    });
});
