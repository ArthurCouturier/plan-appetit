export interface AdminIngredientListItemDTO {
    uuid: string;
    name: string;
    nameNormalized: string;
    emoji: string | null;
    categoryCode: string;
    needsReview: boolean;
    usageCount: number;
    derivedFromUuid: string | null;
    derivedPartLabel: string | null;
}

export interface AdminIngredientListPageDTO {
    total: number;
    page: number;
    size: number;
    items: AdminIngredientListItemDTO[];
}

export interface AdminIngredientNeighborDTO extends AdminIngredientListItemDTO {
    score: number;
    suggestedDelta: string;
}

export interface AdminIngredientNeighborsDTO {
    source: AdminIngredientListItemDTO;
    neighbors: AdminIngredientNeighborDTO[];
}

export interface AdminIngredientListParams {
    page?: number;
    size?: number;
    category?: string;
    q?: string;
    needsReviewOnly?: boolean;
    derivedFromOnly?: boolean;
}

export interface AdminIngredientMergeWithDeltaRequest {
    preparationNoteDelta?: string;
}

export interface AdminIngredientDeriveFromRequest {
    partLabel: string;
}

export interface AdminIngredientDismissPairRequest {
    a: string;
    b: string;
}

export interface AdminIngredientOkResponse {
    ok: boolean;
}

export interface AdminIngredientMergeWithDeltaResponse {
    merged: number;
    deleted: boolean;
}

export type UpdateIngredientRequestBody = {
    name?: string;
    emoji?: string | null;
    clearEmoji?: boolean;
    categoryCode?: string;
};
