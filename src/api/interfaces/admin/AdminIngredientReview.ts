export interface AdminIngredientCandidateDTO {
    uuid: string;
    name: string;
    nameNormalized: string;
    emoji: string | null;
    categoryCode: string;
    usageCount: number;
    score: number;
}

export interface AdminIngredientReviewItemDTO {
    uuid: string;
    name: string;
    nameNormalized: string;
    emoji: string | null;
    categoryCode: string;
    reviewNotes: string | null;
    usageCount: number;
    candidates: AdminIngredientCandidateDTO[];
}

export interface AdminIngredientReviewListDTO {
    items: AdminIngredientReviewItemDTO[];
}

export interface AdminIngredientMergeResponse {
    merged: number;
    deleted: boolean;
}

export interface AdminIngredientAcceptResponse {
    accepted: boolean;
}
