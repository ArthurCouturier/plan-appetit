export interface SubscriptionStatusInterface {
    isActive: boolean;
    isPremium: boolean;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
    stripeSubscriptionId: string | null;
}

export interface CancelSubscriptionRequest {
    reasonCode: CancellationReasonCode;
    reasonText?: string;
}

export enum CancellationReasonCode {
    TOO_EXPENSIVE = "TOO_EXPENSIVE",
    NOT_USING_ENOUGH = "NOT_USING_ENOUGH",
    MISSING_FEATURES = "MISSING_FEATURES",
    FOUND_ALTERNATIVE = "FOUND_ALTERNATIVE",
    TECHNICAL_ISSUES = "TECHNICAL_ISSUES",
    OTHER = "OTHER"
}

export const CancellationReasonLabels: Record<CancellationReasonCode, string> = {
    [CancellationReasonCode.TOO_EXPENSIVE]: "Trop cher",
    [CancellationReasonCode.NOT_USING_ENOUGH]: "Je n'utilise pas assez l'application",
    [CancellationReasonCode.MISSING_FEATURES]: "Il manque des fonctionnalités",
    [CancellationReasonCode.FOUND_ALTERNATIVE]: "J'ai trouvé une alternative",
    [CancellationReasonCode.TECHNICAL_ISSUES]: "Problèmes techniques",
    [CancellationReasonCode.OTHER]: "Autre raison"
};
