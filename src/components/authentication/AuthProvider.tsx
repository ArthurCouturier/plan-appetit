import { SetStateAction, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { useQueryClient } from '@tanstack/react-query';
import UserInterface, { UserRole } from '../../api/interfaces/users/UserInterface';
import { AuthContext } from '../../api/authentication/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { convertFirebaseUser } from '../../api/authentication/convertFirebaseUser';
import { auth } from '../../api/authentication/firebase';
import BackendService from '../../api/services/BackendService';
import NotificationService from '../../api/services/NotificationService';
import { queryKeys } from '../../api/queryConfig';

const CACHED_BACKEND_USER_KEY = 'cachedBackendUser';

/** Race une promise contre un timeout. Si timeout → rejette avec une erreur explicite. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout ${label} (${ms}ms)`)), ms);
        promise.then(
            (v) => { clearTimeout(timer); resolve(v); },
            (e) => { clearTimeout(timer); reject(e); },
        );
    });
}

function readCachedBackendUser(): Partial<UserInterface> | null {
    try {
        const raw = localStorage.getItem(CACHED_BACKEND_USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function writeCachedBackendUser(user: unknown): void {
    try {
        localStorage.setItem(CACHED_BACKEND_USER_KEY, JSON.stringify(user));
    } catch {
        // best-effort
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserInterface | null | undefined>(undefined);
    const queryClient = useQueryClient();

    const login = (userData: SetStateAction<UserInterface | null | undefined>) => setUser(userData);
    const logout = () => {
        queryClient.removeQueries();
        localStorage.removeItem(CACHED_BACKEND_USER_KEY);
        setUser(null);
    };

    useEffect(() => {
        const initAuth = async () => {
            const userLoggedOut = localStorage.getItem('userLoggedOut') === 'true';
            if (userLoggedOut) {
                console.log('Utilisateur déconnecté volontairement, pas de reconnexion automatique');
                setUser(null);
                return;
            }

            if (Capacitor.isNativePlatform()) {
                // getCurrentUser est local au plugin Capacitor Firebase, pas de réseau requis.
                // C'est le seul gate "vraie absence de session" qui peut setUser(null).
                let firebaseUser: { uid: string; email: string | null; displayName: string | null; photoUrl: string | null } | null = null;
                try {
                    const result = await FirebaseAuthentication.getCurrentUser();
                    firebaseUser = result.user;
                } catch (error) {
                    console.error('getCurrentUser failed', error);
                    setUser(null);
                    return;
                }

                if (!firebaseUser) {
                    console.log('Aucune session native trouvée');
                    setUser(null);
                    return;
                }

                console.log('Session native restaurée pour:', firebaseUser.email);

                // Refresh token : forceRefresh:true conservé (fonctionne online).
                // Timeout 5s pour ne pas hang offline. Si fail → on garde le token cached.
                const cachedToken = localStorage.getItem('firebaseIdToken') || '';
                let token = cachedToken;
                try {
                    const idTokenResult = await withTimeout(
                        FirebaseAuthentication.getIdToken({ forceRefresh: true }),
                        5000,
                        'getIdToken',
                    );
                    if (idTokenResult.token) {
                        token = idTokenResult.token;
                        localStorage.setItem('firebaseIdToken', token);
                    }
                } catch (error) {
                    console.warn('Token refresh failed (offline/timeout), using cached token', error);
                }

                if (firebaseUser.email) {
                    localStorage.setItem('email', firebaseUser.email);
                }

                const cachedProfilePhoto = localStorage.getItem('profilePhoto') || '/no-pp.jpg';
                const userData: UserInterface = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Utilisateur',
                    token: token,
                    provider: 'google',
                    role: UserRole.MEMBER,
                    isPremium: false,
                    createdAt: new Date(),
                    profilePhoto: firebaseUser.photoUrl || cachedProfilePhoto,
                };

                // Sync backend avec timeout 5s. Si fail → on enrichit userData depuis cachedBackendUser.
                // Jamais de setUser(null) sur erreur réseau : on garde la session active.
                try {
                    const backendUser = await withTimeout(
                        BackendService.connectUser(userData.email, token),
                        5000,
                        'connectUser',
                    );
                    userData.role = backendUser.role;
                    userData.isPremium = backendUser.isPremium;
                    if (backendUser.uid) userData.uid = backendUser.uid;
                    if (backendUser.displayName) userData.displayName = backendUser.displayName;
                    if (backendUser.profilePhoto) userData.profilePhoto = backendUser.profilePhoto;
                    queryClient.setQueryData(queryKeys.user.connect(), backendUser);
                    writeCachedBackendUser(backendUser);
                } catch (err) {
                    console.warn('Backend sync failed (offline/timeout), restoring from cache', err);
                    const cached = readCachedBackendUser();
                    if (cached) {
                        if (cached.uid) userData.uid = cached.uid;
                        if (cached.role) userData.role = cached.role;
                        if (typeof cached.isPremium === 'boolean') userData.isPremium = cached.isPremium;
                        if (cached.displayName) userData.displayName = cached.displayName;
                        if (cached.profilePhoto) userData.profilePhoto = cached.profilePhoto;
                    }
                }

                localStorage.setItem('profilePhoto', userData.profilePhoto || '/no-pp.jpg');
                setUser(userData);

                if (token) {
                    NotificationService.isPermissionGranted().then(granted => {
                        if (granted) {
                            NotificationService.registerTokenWithBackend(userData.email, token)
                                .catch(err => console.log('Token FCM non re-enregistré:', err));
                        }
                    });
                }
            } else {
                // Sur web, listener Firebase standard
                const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                    if (firebaseUser) {
                        setUser(await convertFirebaseUser(firebaseUser));
                    } else {
                        setUser(null);
                    }
                });
                return unsubscribe;
            }
        };

        initAuth();
    }, []);

    useEffect(() => {
        if (!Capacitor.isNativePlatform()) {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                if (firebaseUser) {
                    setUser(await convertFirebaseUser(firebaseUser));
                } else {
                    setUser(null);
                }
            });
            return unsubscribe;
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
