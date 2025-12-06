import { SetStateAction, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import UserInterface, { UserRole } from '../../api/interfaces/users/UserInterface';
import { AuthContext } from '../../api/authentication/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { convertFirebaseUser } from '../../api/authentication/convertFirebaseUser';
import { auth } from '../../api/authentication/firebase';
import BackendService from '../../api/services/BackendService';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserInterface | null | undefined>(undefined);

    const login = (userData: SetStateAction<UserInterface | null | undefined>) => setUser(userData);
    const logout = () => setUser(null);

    useEffect(() => {
        const initAuth = async () => {
            // Vérifier si l'utilisateur s'est déconnecté volontairement
            const userLoggedOut = localStorage.getItem('userLoggedOut') === 'true';

            if (userLoggedOut) {
                console.log('Utilisateur déconnecté volontairement, pas de reconnexion automatique');
                setUser(null);
                return;
            }

            if (Capacitor.isNativePlatform()) {
                // Sur iOS/Android natif, utiliser le plugin Capacitor Firebase
                try {
                    const result = await FirebaseAuthentication.getCurrentUser();

                    if (result.user) {
                        console.log('Session native restaurée pour:', result.user.email);

                        // Récupérer un nouveau token
                        const idTokenResult = await FirebaseAuthentication.getIdToken({ forceRefresh: true });

                        // Mettre à jour le localStorage
                        localStorage.setItem('firebaseIdToken', idTokenResult.token || "");
                        localStorage.setItem('email', result.user.email || "");
                        localStorage.setItem('profilePhoto', result.user.photoUrl || "/no-pp.jpg");

                        // Créer userData
                        const userData: UserInterface = {
                            uid: result.user.uid,
                            email: result.user.email || "",
                            displayName: result.user.displayName || result.user.email?.split('@')[0] || "Utilisateur",
                            token: idTokenResult.token,
                            provider: "google",
                            role: UserRole.MEMBER,
                            isPremium: false,
                            createdAt: new Date(),
                            profilePhoto: result.user.photoUrl || "/no-pp.jpg"
                        };

                        // Synchroniser avec le backend pour récupérer le rôle actuel
                        try {
                            const backendUser = await BackendService.connectUser(
                                userData.email,
                                idTokenResult.token || ""
                            );
                            userData.role = backendUser.role;
                            userData.isPremium = backendUser.isPremium;
                        } catch (err) {
                            console.warn('Backend sync failed during session restore, using default values');
                        }

                        setUser(userData);
                    } else {
                        console.log('Aucune session native trouvée');
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Erreur lors de la restauration de session native:', error);
                    setUser(null);
                }
            } else {
                // Sur web, utiliser le listener Firebase standard
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

    // Listener pour les changements d'état sur le web (si non-natif)
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
