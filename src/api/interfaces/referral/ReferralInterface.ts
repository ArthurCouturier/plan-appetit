export interface ReferralStatsInterface {
    referralCode: string;
    shareUrl: string;
    hasReferrer: boolean;
    activationsCount: number;
    creditsEarnedFromActivations: number;
    creditsEarnedFromPurchases: number;
    totalCreditsEarned: number;
    activationCap: number;
}

export type ReferralErrorCode =
    | "ALREADY_HAS_REFERRER"
    | "SELF_REFERRAL"
    | "CODE_NOT_FOUND"
    | "INVALID_FORMAT"
    | "UNAUTHORIZED"
    | "INTERNAL_ERROR";

export interface ApplyReferralResponseInterface {
    success: boolean;
    errorCode?: ReferralErrorCode | null;
    message?: string | null;
    creditsAdded: number;
    referrerUnlockedImmediately: boolean;
}

export const REFERRAL_CODE_LENGTH = 6;
export const REFERRAL_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

export function normalizeReferralCode(input: string): string {
    return input.trim().toUpperCase();
}

export function isValidReferralCode(code: string): boolean {
    if (code.length !== REFERRAL_CODE_LENGTH) return false;
    for (const ch of code) {
        if (!REFERRAL_CODE_ALPHABET.includes(ch)) return false;
    }
    return true;
}
