import { auth } from "../authentication/firebase";

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

                const user = auth.currentUser;

                if (user) {
                    const newToken = await user.getIdToken(true);
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
