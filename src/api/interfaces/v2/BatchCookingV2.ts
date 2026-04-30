export interface BatchCookingV2PreferencesDTO {
    cuisineStyles: string[];
    dietaryRestrictions: string[];
    availableEquipment: string[];
    excludedIngredients: string[];
}

export interface BatchCookingV2SlotDTO {
    uuid: string;
    slotIndex: number;
    peopleCount: number;
    mealType: string;
}

export interface BatchCookingV2RecipeRefDTO {
    uuid: string;
    name: string;
    emoji: string | null;
    courseCode: string | null;
    covers: number;
    totalTimeMin: number | null;
    buyPrice: string | null;
    displayOrder: number;
    slotUuid: string | null;
}

export interface BatchCookingV2ShoppingItemDTO {
    uuid: string;
    ingredientUuid: string;
    ingredientName: string;
    ingredientEmoji: string | null;
    ingredientCategoryCode: string;
    totalQuantity: string;
    unitCode: string;
    estimatedPrice: string;
    isChecked: boolean;
    recipeUuids: string[];
}

// Les execution steps BC partagent le même formalisme que les recipe steps v2
// (rendu cohérent via RecipeStepsListV2 côté front, ingredientsUsed inclus).
import type { RecipeV2StepDTO } from "./RecipeV2";
export type BatchCookingV2ExecutionStepDTO = RecipeV2StepDTO;

export interface BatchCookingV2DTO {
    uuid: string;
    name: string;
    month: number;
    mode: string;
    totalMeals: number;
    defaultPeopleCount: number | null;
    budgetTarget: string;
    preferences: BatchCookingV2PreferencesDTO;
    costTotal: string;
    costPerMeal: string;
    costPerPerson: string;
    currency: string;
    status: string;
    userUid: string | null;
    createdAt: string;
    updatedAt: string;
    slots: BatchCookingV2SlotDTO[];
    recipes: BatchCookingV2RecipeRefDTO[];
    shoppingItems: BatchCookingV2ShoppingItemDTO[];
    executionSteps: BatchCookingV2ExecutionStepDTO[];
}

export interface BatchCookingV2SummaryDTO {
    uuid: string;
    name: string;
    month: number;
    totalMeals: number;
    status: string;
    costTotal: string;
    currency: string;
    recipesCount: number;
    /** Jusqu'à 4 UUIDs pour l'aperçu thumbnail dans BatchCookingCard. */
    recipePreviewUuids: string[];
    createdAt: string;
}

export interface BatchCookingV2ListDTO {
    total: number;
    items: BatchCookingV2SummaryDTO[];
}
