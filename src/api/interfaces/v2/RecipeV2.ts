export interface RecipeV2IngredientDTO {
    uuid: string;
    ingredientUuid: string;
    name: string;
    nameNormalized: string;
    emoji: string | null;
    categoryCode: string;
    quantity: string | null;
    unitCode: string;
    preparationNote: string | null;
    isOptional: boolean;
    displayOrder: number;
    needsReview: boolean;
    derivedFromUuid: string | null;
    derivedPartLabel: string | null;
}

export type RecipeV2StepIngredientUsedDTO = {
    name: string;
    quantity: string;
    unitCode: string;
};

export interface RecipeV2StepDTO {
    uuid: string;
    stepKey: number;
    displayOrder: number;
    title: string | null;
    instruction: string;
    stepType: string;
    durationMin: number | null;
    restMin: number | null;
    heatingSurface: string | null;
    temperatureC: number | null;
    heatingIntensityLabel: string | null;
    primaryTechniqueCode: string | null;
    tipFr: string | null;
    isParallelizable: boolean;
    photoUrl: string | null;
    equipments: string[];
    ingredientsUsed: RecipeV2StepIngredientUsedDTO[];
}

export interface RecipeV2ImageDTO {
    uuid: string;
    mimeType: string;
    widthPx: number | null;
    heightPx: number | null;
    createdAt: string;
}

export interface RecipeV2OwnerDTO {
    uid: string;
    displayName: string | null;
    profilePhotoUrl: string | null;
}

export interface RecipeV2DTO {
    uuid: string;
    name: string;
    description: string | null;
    emoji: string | null;
    kind: string | null;
    courseCode: string | null;
    covers: number;
    prepTimeMin: number | null;
    cookTimeMin: number | null;
    restTimeMin: number | null;
    totalTimeMin: number | null;
    buyPrice: string | null;
    sellPrice: string | null;
    promotion: string | null;
    currency: string;
    isPublic: boolean;
    isGenerated: boolean;
    isImported: boolean;
    remainingModifications: number;
    keyTrickFr: string | null;
    rescuePlanFr: string | null;
    dailyRecipeType: string | null;
    parentRecipeUuid: string | null;
    batchCookingUuid: string | null;
    userUid: string | null;
    creationDate: string;
    updatedAt: string;
    seasons: string[];
    ingredients: RecipeV2IngredientDTO[];
    steps: RecipeV2StepDTO[];
    images: RecipeV2ImageDTO[];
    owner: RecipeV2OwnerDTO | null;
}

export interface RecipeV2SummaryDTO {
    uuid: string;
    name: string;
    emoji: string | null;
    courseCode: string | null;
    covers: number;
    prepTimeMin: number | null;
    totalTimeMin: number | null;
    seasons: string[];
    updatedAt: string;
    userUid: string | null;
}

export interface RecipeV2CardSummaryDTO {
    uuid: string;
    name: string;
    emoji: string | null;
    covers: number;
    buyPrice: number | null;
    totalTimeMin: number | null;
    restTimeMin: number | null;
    creationDate: string | null;
}

export interface RecipeV2ListDTO {
    total: number;
    items: RecipeV2SummaryDTO[];
}
