export default interface UserInterface {
    /** Firebase generated ID */
    uid: string;
    email: string;
    displayName: string;
    token?: string;
    provider: "email" | "google" | "facebook" | "apple";
    isPremium: boolean;
    createdAt: Date;
    lastLogin?: Date;
}
