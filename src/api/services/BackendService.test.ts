import { describe, it, expect, beforeEach, vi } from 'vitest';
import BackendService from './BackendService';

describe('BackendService', () => {
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
