import { describe, it, expect, beforeEach, vi } from 'vitest';
import AccountDeletionService from './AccountDeletionService';

describe('AccountDeletionService', () => {
    const mockEmail = 'test@example.com';
    const mockToken = 'fake-token-123';

    beforeEach(() => {
        vi.clearAllMocks();
        (global.fetch as any) = vi.fn();
    });

    // Helper pour construire l'URL attendue
    const getExpectedUrl = (path: string) => {
        return `${AccountDeletionService.baseUrl}:${AccountDeletionService.port}${path}`;
    };

    describe('requestAccountDeletion', () => {
        it('devrait programmer la suppression du compte avec succès', async () => {
            const mockResponse = {
                success: true,
                message: 'La suppression de votre compte est programmée.',
                scheduledDeletionDate: '2025-12-23T18:00:00Z',
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await AccountDeletionService.requestAccountDeletion(mockEmail, mockToken);

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                getExpectedUrl('/api/v1/users/account'),
                expect.objectContaining({
                    method: 'DELETE',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${mockToken}`,
                        'Email': mockEmail,
                    }),
                })
            );
        });

        it('devrait retourner une erreur si la suppression est déjà programmée', async () => {
            const mockResponse = {
                success: false,
                message: 'Une suppression est déjà programmée pour ce compte.',
                scheduledDeletionDate: '2025-12-23T18:00:00Z',
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await AccountDeletionService.requestAccountDeletion(mockEmail, mockToken);

            expect(result.success).toBe(false);
            expect(result.scheduledDeletionDate).toBeDefined();
        });

        it('devrait gérer les erreurs réseau', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            await expect(
                AccountDeletionService.requestAccountDeletion(mockEmail, mockToken)
            ).rejects.toThrow('Network error');
        });
    });

    describe('cancelAccountDeletion', () => {
        it('devrait annuler la suppression programmée avec succès', async () => {
            const mockResponse = {
                success: true,
                message: 'La suppression de votre compte a été annulée.',
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await AccountDeletionService.cancelAccountDeletion(mockEmail, mockToken);

            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                getExpectedUrl('/api/v1/users/account/cancel-deletion'),
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${mockToken}`,
                        'Email': mockEmail,
                    }),
                })
            );
        });

        it('devrait retourner une erreur si aucune suppression n\'est programmée', async () => {
            const mockResponse = {
                success: false,
                message: 'Aucune suppression n\'est programmée pour ce compte.',
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await AccountDeletionService.cancelAccountDeletion(mockEmail, mockToken);

            expect(result.success).toBe(false);
        });

        it('devrait gérer les erreurs réseau', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            await expect(
                AccountDeletionService.cancelAccountDeletion(mockEmail, mockToken)
            ).rejects.toThrow('Network error');
        });
    });

    describe('getAccountDeletionStatus', () => {
        it('devrait retourner le statut quand la suppression est programmée', async () => {
            const mockResponse = {
                isDeletionScheduled: true,
                scheduledDeletionDate: '2025-12-23T18:00:00Z',
                canCancel: true,
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await AccountDeletionService.getAccountDeletionStatus(mockEmail, mockToken);

            expect(result).toEqual(mockResponse);
            expect(result.isDeletionScheduled).toBe(true);
            expect(result.canCancel).toBe(true);
            expect(fetch).toHaveBeenCalledWith(
                getExpectedUrl('/api/v1/users/account/deletion-status'),
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

        it('devrait retourner le statut quand aucune suppression n\'est programmée', async () => {
            const mockResponse = {
                isDeletionScheduled: false,
                scheduledDeletionDate: undefined,
                canCancel: false,
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await AccountDeletionService.getAccountDeletionStatus(mockEmail, mockToken);

            expect(result.isDeletionScheduled).toBe(false);
            expect(result.scheduledDeletionDate).toBeUndefined();
            expect(result.canCancel).toBe(false);
        });

        it('devrait retourner canCancel false quand le compte est déjà supprimé', async () => {
            const mockResponse = {
                isDeletionScheduled: true,
                scheduledDeletionDate: '2025-12-23T18:00:00Z',
                canCancel: false,
            };

            vi.mocked(fetch).mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse,
            } as Response);

            const result = await AccountDeletionService.getAccountDeletionStatus(mockEmail, mockToken);

            expect(result.isDeletionScheduled).toBe(true);
            expect(result.canCancel).toBe(false);
        });

        it('devrait gérer les erreurs réseau', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            await expect(
                AccountDeletionService.getAccountDeletionStatus(mockEmail, mockToken)
            ).rejects.toThrow('Network error');
        });
    });
});
