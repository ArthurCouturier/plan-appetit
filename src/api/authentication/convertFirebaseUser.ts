import { getIdToken, User } from 'firebase/auth';
import UserInterface from '../interfaces/users/UserInterface';

export const convertFirebaseUser = async (firebaseUser: User): Promise<UserInterface> => {
    const providerData = firebaseUser.providerData[0];
    let provider: "email" | "google" | "facebook" | "apple" = "email";
    if (providerData) {
        if (providerData.providerId === "google.com") provider = "google";
        else if (providerData.providerId === "facebook.com") provider = "facebook";
        else if (providerData.providerId === "apple.com") provider = "apple";
    }
    return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || "",
        displayName: firebaseUser.displayName || "",
        provider,
        isPremium: false,
        createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : new Date(),
        lastLogin: firebaseUser.metadata.lastSignInTime ? new Date(firebaseUser.metadata.lastSignInTime) : undefined,
        token: await getIdToken(firebaseUser, false),
        profilePhoto: firebaseUser.photoURL || "/no-pp.jpg",
    };
};
