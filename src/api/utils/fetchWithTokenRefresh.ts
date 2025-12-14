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
    options: RequestInit
): Promise<Response> {
    let response = await fetch(url, options);

    if (response.status === 401) {
        try {
            const errorData = await response.json();

            if (errorData.error === 'TOKEN_EXPIRED') {
                console.log('Token expiré, rafraîchissement automatique...');

                const newToken = await getNewToken();

                if (newToken) {
                    localStorage.setItem('firebaseIdToken', newToken);

                    const newHeaders = new Headers(options.headers);
                    newHeaders.set('Authorization', `Bearer ${newToken}`);

                    response = await fetch(url, {
                        ...options,
                        headers: newHeaders,
                    });

                    console.log('Token rafraîchi et requête réessayée avec succès');
                } else {
                    throw new Error('Utilisateur non authentifié');
                }
            }
        } catch (error) {
            console.error('Erreur lors du refresh du token:', error);
        }
    }

    return response;
}
