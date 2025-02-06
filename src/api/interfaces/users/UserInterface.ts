export default interface UserInterface {
    /** L'identifiant unique généré par Firebase */
    uid: string;
    email: string;
    displayName: string;
    token?: string;
    provider: "email" | "google" | "facebook" | "apple";
    isPremium: boolean;
    createdAt: Date;
    lastLogin?: Date;
}
