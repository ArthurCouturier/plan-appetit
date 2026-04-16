import { auth } from "../authentication/firebase";
import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

async function getNewToken(): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
        try {
            const result = await FirebaseAuthentication.getCurrentUser();
            if (result.user) {
                const idTokenResult = await FirebaseAuthentication.getIdToken({ forceRefresh: true });
                return idTokenResult.token;
            }
        } catch (error) {
            console.error('Erreur lors du refresh du token natif:', error);
        }
        return null;
    } else {
        const user = auth.currentUser;
        if (user) {
            return await user.getIdToken(true);
        }
        return null;
    }
}

export async function fetchWithTokenRefresh(
    url: string,
    options: RequestInit,
    maxRetries: number = 2,
    timeoutMs: number = 180_000,
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const fetchOptions = { ...options, signal: controller.signal };

    let response: Response;
    try {
        response = await fetch(url, fetchOptions);
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('La requete a expire (timeout)');
        }
        throw error;
    }
    clearTimeout(timeoutId);

    for (let attempt = 0; attempt < maxRetries && response.status === 401; attempt++) {
        try {
            const errorData = await response.json();

            if (errorData.error !== 'TOKEN_EXPIRED') break;

            console.log(`Token expiré, tentative de refresh ${attempt + 1}/${maxRetries}...`);

            const newToken = await getNewToken();

            if (!newToken) {
                throw new Error('Utilisateur non authentifié');
            }

            localStorage.setItem('firebaseIdToken', newToken);

            const newHeaders = new Headers(options.headers);
            newHeaders.set('Authorization', `Bearer ${newToken}`);

            response = await fetch(url, {
                ...options,
                headers: newHeaders,
            });

            if (response.status !== 401) {
                console.log('Token rafraîchi et requête réessayée avec succès');
            }
        } catch (error) {
            console.error('Erreur lors du refresh du token:', error);
            break;
        }
    }

    return response;
}
