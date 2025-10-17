import { getIdToken, User } from 'firebase/auth';
import UserInterface, { UserRole } from '../interfaces/users/UserInterface';
import BackendService from '../services/BackendService';

export const convertFirebaseUser = async (firebaseUser: User): Promise<UserInterface> => {
    const providerData = firebaseUser.providerData[0];
    let provider: "email" | "google" | "facebook" | "apple" = "email";
    if (providerData) {
        if (providerData.providerId === "google.com") provider = "google";
        else if (providerData.providerId === "facebook.com") provider = "facebook";
        else if (providerData.providerId === "apple.com") provider = "apple";
    }

    const token = await getIdToken(firebaseUser, false);
    const email = firebaseUser.email || "";

    // Récupérer les informations utilisateur depuis le backend (incluant le rôle)
    try {
        const backendUserData = await BackendService.connectUser(email, token);

        // Fusionner les données Firebase avec les données backend
        return {
            ...backendUserData,
            uid: firebaseUser.uid,
            email,
            displayName: firebaseUser.displayName || backendUserData.displayName || "",
            token,
            provider,
            profilePhoto: firebaseUser.photoURL || backendUserData.profilePhoto || "/no-pp.jpg",
            lastLogin: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : backendUserData.lastLogin,
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des données backend:", error);

        // Fallback : retourner les données Firebase seules avec un rôle par défaut
        return {
            uid: firebaseUser.uid,
            email,
            displayName: firebaseUser.displayName || "",
            provider,
            role: UserRole.MEMBER,
            isPremium: false,
            createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
            lastLogin: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : undefined,
            token,
            profilePhoto: firebaseUser.photoURL || "/no-pp.jpg",
        };
    }
};
