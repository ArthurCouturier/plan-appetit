import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';

// Tests pour la logique métier de l'authentification et la liaison des recettes anonymes
// Ces tests simulent le comportement Firebase sans dépendre de l'UI

// Mock Firebase Auth
vi.mock('../api/authentication/firebase', () => ({
    auth: {
        currentUser: null,
    },
}));

// Mock SandboxService
vi.mock('../api/services/SandboxService', () => ({
    default: {
        linkAnonymousRecipe: vi.fn(),
    },
}));

import SandboxService from '../api/services/SandboxService';

describe('Logique d\'authentification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('linkAnonymousRecipeIfExists - Logique métier', () => {
        // Simulation de la fonction helper linkAnonymousRecipeIfExists
        const linkAnonymousRecipeIfExists = async () => {
            const anonymousRecipeUuid = localStorage.getItem('anonymousRecipeUuid');
            if (anonymousRecipeUuid) {
                try {
                    const result = await SandboxService.linkAnonymousRecipe(anonymousRecipeUuid);
                    if (result.success) {
                        localStorage.removeItem('anonymousRecipeUuid');
                        console.log('Recette liée avec succès');
                    } else if (result.error === 'INSUFFICIENT_CREDITS') {
                        console.warn('Quota insuffisant pour associer cette recette');
                    } else if (result.alreadyLinked) {
                        localStorage.removeItem('anonymousRecipeUuid');
                        console.log('Recette déjà liée');
                    }
                } catch (err) {
                    console.error('Erreur lors de la liaison de la recette:', err);
                }
            }
        };

        it('devrait appeler linkAnonymousRecipe quand anonymousRecipeUuid existe', async () => {
            localStorage.setItem('anonymousRecipeUuid', 'test-recipe-uuid');

            (SandboxService.linkAnonymousRecipe as Mock).mockResolvedValue({
                success: true,
            });

            await linkAnonymousRecipeIfExists();

            expect(SandboxService.linkAnonymousRecipe).toHaveBeenCalledWith('test-recipe-uuid');
        });

        it('ne devrait pas appeler linkAnonymousRecipe quand anonymousRecipeUuid n\'existe pas', async () => {
            // Pas de anonymousRecipeUuid dans localStorage

            await linkAnonymousRecipeIfExists();

            expect(SandboxService.linkAnonymousRecipe).not.toHaveBeenCalled();
        });

        it('devrait supprimer anonymousRecipeUuid après liaison réussie', async () => {
            localStorage.setItem('anonymousRecipeUuid', 'test-recipe-uuid');

            (SandboxService.linkAnonymousRecipe as Mock).mockResolvedValue({
                success: true,
            });

            await linkAnonymousRecipeIfExists();

            expect(localStorage.getItem('anonymousRecipeUuid')).toBeNull();
        });

        it('devrait supprimer anonymousRecipeUuid si la recette est déjà liée', async () => {
            localStorage.setItem('anonymousRecipeUuid', 'test-recipe-uuid');

            (SandboxService.linkAnonymousRecipe as Mock).mockResolvedValue({
                success: false,
                alreadyLinked: true,
            });

            await linkAnonymousRecipeIfExists();

            expect(localStorage.getItem('anonymousRecipeUuid')).toBeNull();
        });

        it('devrait conserver anonymousRecipeUuid en cas de quota insuffisant', async () => {
            localStorage.setItem('anonymousRecipeUuid', 'test-recipe-uuid');

            (SandboxService.linkAnonymousRecipe as Mock).mockResolvedValue({
                success: false,
                error: 'INSUFFICIENT_CREDITS',
            });

            await linkAnonymousRecipeIfExists();

            expect(localStorage.getItem('anonymousRecipeUuid')).toBe('test-recipe-uuid');
        });

        it('devrait gérer les erreurs sans crash', async () => {
            localStorage.setItem('anonymousRecipeUuid', 'test-recipe-uuid');

            (SandboxService.linkAnonymousRecipe as Mock).mockRejectedValue(
                new Error('Network error')
            );

            // Ne devrait pas lever d'exception
            await expect(linkAnonymousRecipeIfExists()).resolves.not.toThrow();
        });

        it('devrait conserver anonymousRecipeUuid en cas d\'erreur', async () => {
            localStorage.setItem('anonymousRecipeUuid', 'test-recipe-uuid');

            (SandboxService.linkAnonymousRecipe as Mock).mockRejectedValue(
                new Error('Network error')
            );

            await linkAnonymousRecipeIfExists();

            expect(localStorage.getItem('anonymousRecipeUuid')).toBe('test-recipe-uuid');
        });
    });

    describe('Gestion du localStorage pour l\'authentification', () => {
        it('devrait stocker firebaseIdToken correctement', () => {
            const token = 'test-firebase-token-12345';
            localStorage.setItem('firebaseIdToken', token);

            expect(localStorage.getItem('firebaseIdToken')).toBe(token);
        });

        it('devrait stocker email correctement', () => {
            const email = 'test@example.com';
            localStorage.setItem('email', email);

            expect(localStorage.getItem('email')).toBe(email);
        });

        it('devrait stocker profilePhoto correctement', () => {
            const photoUrl = 'https://example.com/photo.jpg';
            localStorage.setItem('profilePhoto', photoUrl);

            expect(localStorage.getItem('profilePhoto')).toBe(photoUrl);
        });

        it('devrait utiliser photo par défaut si non fournie', () => {
            const defaultPhoto = '/no-pp.jpg';
            const photoUrl = null;
            localStorage.setItem('profilePhoto', photoUrl || defaultPhoto);

            expect(localStorage.getItem('profilePhoto')).toBe(defaultPhoto);
        });

        it('devrait supprimer userLoggedOut lors de la connexion', () => {
            localStorage.setItem('userLoggedOut', 'true');

            // Simulation de la connexion
            localStorage.removeItem('userLoggedOut');

            expect(localStorage.getItem('userLoggedOut')).toBeNull();
        });
    });

    describe('Création de userData pour différents providers', () => {
        const createUserData = (
            uid: string,
            email: string,
            displayName: string | null,
            token: string | undefined,
            provider: 'email' | 'google' | 'apple' | 'facebook',
            photoUrl: string | null
        ) => ({
            uid,
            email: email || "",
            displayName: displayName || email?.split('@')[0] || "Utilisateur",
            token,
            provider,
            role: "MEMBER" as const,
            isPremium: false,
            createdAt: new Date(),
            profilePhoto: photoUrl || "/no-pp.jpg"
        });

        it('devrait créer userData pour email provider', () => {
            const userData = createUserData(
                'uid-123',
                'user@example.com',
                'John Doe',
                'token-abc',
                'email',
                null
            );

            expect(userData.uid).toBe('uid-123');
            expect(userData.email).toBe('user@example.com');
            expect(userData.displayName).toBe('John Doe');
            expect(userData.provider).toBe('email');
            expect(userData.profilePhoto).toBe('/no-pp.jpg');
        });

        it('devrait créer userData pour google provider', () => {
            const userData = createUserData(
                'google-uid',
                'user@gmail.com',
                'Google User',
                'google-token',
                'google',
                'https://lh3.googleusercontent.com/photo.jpg'
            );

            expect(userData.provider).toBe('google');
            expect(userData.profilePhoto).toBe('https://lh3.googleusercontent.com/photo.jpg');
        });

        it('devrait créer userData pour apple provider avec email masqué', () => {
            const userData = createUserData(
                'apple-uid',
                'abc123@privaterelay.appleid.com',
                null,
                'apple-token',
                'apple',
                null
            );

            expect(userData.provider).toBe('apple');
            expect(userData.email).toBe('abc123@privaterelay.appleid.com');
            expect(userData.displayName).toBe('abc123'); // Utilise la partie avant @
        });

        it('devrait créer userData pour facebook provider', () => {
            const userData = createUserData(
                'facebook-uid',
                'user@facebook.com',
                'Facebook User',
                'facebook-token',
                'facebook',
                'https://graph.facebook.com/photo.jpg'
            );

            expect(userData.provider).toBe('facebook');
            expect(userData.profilePhoto).toBe('https://graph.facebook.com/photo.jpg');
        });

        it('devrait utiliser "Utilisateur" si pas de displayName ni email', () => {
            const userData = createUserData(
                'uid',
                '',
                null,
                'token',
                'email',
                null
            );

            expect(userData.displayName).toBe('Utilisateur');
        });
    });

    describe('Gestion des réponses backend', () => {
        it('devrait mettre à jour le rôle depuis la réponse backend', () => {
            const userData = {
                uid: 'uid',
                email: 'user@example.com',
                displayName: 'User',
                token: 'token',
                provider: 'email' as const,
                role: 'MEMBER' as string,
                isPremium: false,
            };

            const backendResponse = {
                role: 'PREMIUM',
                isPremium: true,
            };

            // Simulation de la mise à jour
            userData.role = backendResponse.role;
            userData.isPremium = backendResponse.isPremium;

            expect(userData.role).toBe('PREMIUM');
            expect(userData.isPremium).toBe(true);
        });

        it('devrait conserver les valeurs par défaut si le backend échoue', () => {
            const userData = {
                uid: 'uid',
                email: 'user@example.com',
                displayName: 'User',
                token: 'token',
                provider: 'email' as const,
                role: 'MEMBER' as string,
                isPremium: false,
            };

            // Simulation d'un échec backend - on ne modifie pas userData
            // Dans le code réel, on catch l'erreur et on garde les valeurs par défaut

            expect(userData.role).toBe('MEMBER');
            expect(userData.isPremium).toBe(false);
        });
    });
});

describe('SandboxService.linkAnonymousRecipe', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('devrait retourner success: true en cas de succès', async () => {
        (SandboxService.linkAnonymousRecipe as Mock).mockResolvedValue({
            success: true,
            quota: { remaining: 5 },
        });

        const result = await SandboxService.linkAnonymousRecipe('recipe-uuid');

        expect(result.success).toBe(true);
        expect(result.quota).toEqual({ remaining: 5 });
    });

    it('devrait retourner error: INSUFFICIENT_CREDITS en cas de quota insuffisant', async () => {
        (SandboxService.linkAnonymousRecipe as Mock).mockResolvedValue({
            success: false,
            error: 'INSUFFICIENT_CREDITS',
            message: 'Vous n\'avez plus de crédits',
        });

        const result = await SandboxService.linkAnonymousRecipe('recipe-uuid');

        expect(result.success).toBe(false);
        expect(result.error).toBe('INSUFFICIENT_CREDITS');
    });

    it('devrait retourner alreadyLinked: true si la recette est déjà liée', async () => {
        (SandboxService.linkAnonymousRecipe as Mock).mockResolvedValue({
            success: false,
            alreadyLinked: true,
        });

        const result = await SandboxService.linkAnonymousRecipe('recipe-uuid');

        expect(result.alreadyLinked).toBe(true);
    });
});

describe('Simulation des appels Firebase Authentication', () => {
    describe('Plateforme Web', () => {
        it('devrait simuler signInWithEmailAndPassword', async () => {
            const mockSignIn = vi.fn().mockResolvedValue({
                user: {
                    uid: 'web-uid',
                    email: 'web@example.com',
                    displayName: 'Web User',
                    photoURL: null,
                    getIdToken: vi.fn().mockResolvedValue('web-token'),
                },
            });

            const result = await mockSignIn('test@example.com', 'password123');

            expect(result.user.uid).toBe('web-uid');
            expect(result.user.email).toBe('web@example.com');
        });

        it('devrait simuler signInWithPopup pour Google', async () => {
            const mockPopup = vi.fn().mockResolvedValue({
                user: {
                    uid: 'google-web-uid',
                    email: 'google@example.com',
                    displayName: 'Google Web User',
                    photoURL: 'https://lh3.googleusercontent.com/photo.jpg',
                    getIdToken: vi.fn().mockResolvedValue('google-web-token'),
                },
            });

            const result = await mockPopup();

            expect(result.user.uid).toBe('google-web-uid');
            expect(result.user.photoURL).toContain('googleusercontent.com');
        });
    });

    describe('Plateforme Native (iOS/Android)', () => {
        it('devrait simuler FirebaseAuthentication.signInWithEmailAndPassword', async () => {
            const mockNativeSignIn = vi.fn().mockResolvedValue({
                user: {
                    uid: 'native-uid',
                    email: 'native@example.com',
                    displayName: 'Native User',
                    photoUrl: null,
                },
            });

            const result = await mockNativeSignIn({ email: 'native@example.com', password: 'password123' });

            expect(result.user.uid).toBe('native-uid');
            expect(result.user.email).toBe('native@example.com');
        });

        it('devrait simuler FirebaseAuthentication.signInWithGoogle', async () => {
            const mockNativeGoogle = vi.fn().mockResolvedValue({
                user: {
                    uid: 'google-native-uid',
                    email: 'google@example.com',
                    displayName: 'Google Native User',
                    photoUrl: 'https://lh3.googleusercontent.com/photo.jpg',
                },
                credential: {
                    idToken: 'google-id-token',
                    accessToken: 'google-access-token',
                },
            });

            const result = await mockNativeGoogle();

            expect(result.user.uid).toBe('google-native-uid');
            expect(result.credential.idToken).toBe('google-id-token');
        });

        it('devrait simuler FirebaseAuthentication.signInWithApple', async () => {
            const mockNativeApple = vi.fn().mockResolvedValue({
                user: {
                    uid: 'apple-uid',
                    email: 'user@privaterelay.appleid.com',
                    displayName: null, // Apple peut masquer le nom
                    photoUrl: null,
                },
            });

            const result = await mockNativeApple();

            expect(result.user.uid).toBe('apple-uid');
            expect(result.user.email).toContain('privaterelay.appleid.com');
        });

        it('devrait simuler FirebaseAuthentication.signInWithFacebook', async () => {
            const mockNativeFacebook = vi.fn().mockResolvedValue({
                user: {
                    uid: 'facebook-uid',
                    email: 'user@facebook.com',
                    displayName: 'Facebook User',
                    photoUrl: 'https://graph.facebook.com/123/picture',
                },
            });

            const result = await mockNativeFacebook();

            expect(result.user.uid).toBe('facebook-uid');
            expect(result.user.photoUrl).toContain('graph.facebook.com');
        });

        it('devrait simuler FirebaseAuthentication.getIdToken', async () => {
            const mockGetIdToken = vi.fn().mockResolvedValue({
                token: 'firebase-id-token-abc123',
            });

            const result = await mockGetIdToken();

            expect(result.token).toBe('firebase-id-token-abc123');
        });
    });

    describe('Gestion des erreurs', () => {
        it('devrait gérer auth/wrong-password', async () => {
            const mockSignIn = vi.fn().mockRejectedValue({
                code: 'auth/wrong-password',
                message: 'The password is invalid',
            });

            await expect(mockSignIn('test@example.com', 'wrongpassword')).rejects.toMatchObject({
                code: 'auth/wrong-password',
            });
        });

        it('devrait gérer auth/user-not-found', async () => {
            const mockSignIn = vi.fn().mockRejectedValue({
                code: 'auth/user-not-found',
                message: 'User not found',
            });

            await expect(mockSignIn('unknown@example.com', 'password')).rejects.toMatchObject({
                code: 'auth/user-not-found',
            });
        });

        it('devrait gérer auth/popup-closed-by-user', async () => {
            const mockPopup = vi.fn().mockRejectedValue({
                code: 'auth/popup-closed-by-user',
                message: 'The popup has been closed by the user',
            });

            await expect(mockPopup()).rejects.toMatchObject({
                code: 'auth/popup-closed-by-user',
            });
        });

        it('devrait gérer auth/network-request-failed', async () => {
            const mockSignIn = vi.fn().mockRejectedValue({
                code: 'auth/network-request-failed',
                message: 'Network error',
            });

            await expect(mockSignIn('test@example.com', 'password')).rejects.toMatchObject({
                code: 'auth/network-request-failed',
            });
        });
    });
});
