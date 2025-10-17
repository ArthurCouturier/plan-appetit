export enum UserRole {
    MEMBER = "MEMBER",
    BETA_USER = "BETA_USER",
    PREMIUM = "PREMIUM",
    PREMIUM_FOR_EVER = "PREMIUM_FOR_EVER",
    ADMIN = "ADMIN"
}

// Mapping des niveaux de rôles (pour comparaison hiérarchique)
export const USER_ROLE_LEVELS: Record<UserRole, number> = {
    [UserRole.MEMBER]: 0,
    [UserRole.BETA_USER]: 1,
    [UserRole.PREMIUM]: 2,
    [UserRole.PREMIUM_FOR_EVER]: 2,
    [UserRole.ADMIN]: 3
};

// Helper pour vérifier si un utilisateur a un niveau de rôle suffisant
export function hasRoleLevel(userRole: UserRole, requiredRole: UserRole): boolean {
    return USER_ROLE_LEVELS[userRole] >= USER_ROLE_LEVELS[requiredRole];
}

// Helper pour vérifier si un utilisateur est premium (PREMIUM ou PREMIUM_FOR_EVER)
export function isPremiumUser(role: UserRole): boolean {
    return role === UserRole.PREMIUM || role === UserRole.PREMIUM_FOR_EVER;
}

export default interface UserInterface {
    /** Firebase generated ID */
    uid: string;
    email: string;
    displayName: string;
    token?: string;
    provider: "email" | "google" | "facebook" | "apple";
    role: UserRole;
    isPremium: boolean;
    createdAt: Date;
    lastLogin?: Date;
    profilePhoto?: string;
}
