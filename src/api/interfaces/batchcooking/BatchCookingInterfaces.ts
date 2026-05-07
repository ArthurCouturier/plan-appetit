import RecipeInterface from "../recipes/RecipeInterface";
import type { RecipeV2StepDTO } from "../v2/RecipeV2";

export type BatchMode = "SIMPLE" | "DETAILED";
export type MealType = "LUNCH" | "DINNER" | "UNSPECIFIED";
export type BudgetTarget = "ECONOMICAL" | "BALANCED" | "COMFORT";

export interface BatchCookingSlot {
    index: number;
    peopleCount: number;
    type: MealType;
}

export interface BatchCookingConfigRequest {
    mode: BatchMode;
    totalMeals: number;
    defaultPeopleCount?: number;
    slots: BatchCookingSlot[];
}

export interface BatchCookingPreferencesRequest {
    cuisineStyles: string[];
    dietaryRestrictions: string[];
    budgetTarget: BudgetTarget;
    availableEquipment: string[];
    excludedIngredients: string[];
}

export interface BatchCookingRequest {
    name: string;
    config: BatchCookingConfigRequest;
    preferences: BatchCookingPreferencesRequest;
}

export interface BatchCookingShoppingItem {
    uuid: string;
    name: string;
    totalQuantity: number;
    unit: string | null;
    estimatedPrice: number;
    category: string;
    recipeUuids: string[];
}

export interface BatchCookingExecutionStep {
    uuid: string;
    executionOrder: number;
    description: string;
    recipeNames: string[];
    stepType: "ACTIVE" | "PASSIVE" | null;
    durationMinutes: number | null;
    tip: string | null;
}

export interface BatchCookingCost {
    total: number;
    perMeal: number;
    perPerson: number;
    currency: string;
}

export interface BatchCookingResponse {
    uuid: string;
    name: string;
    createdAt: string;
    month: number;
    config: {
        mode: BatchMode;
        totalMeals: number;
        defaultPeopleCount: number | null;
        slots: BatchCookingSlot[];
    };
    preferences: {
        cuisineStyles: string[];
        dietaryRestrictions: string[];
        budgetTarget: BudgetTarget;
        availableEquipment: string[];
        excludedIngredients: string[];
    };
    recipes: RecipeInterface[];
    shoppingList: BatchCookingShoppingItem[];
    estimatedCost: BatchCookingCost;
    /**
     * @deprecated Shape v0 historique. Pour le rendu du plan, préférer `executionStepsV2`
     * qui porte le formalisme step v2 complet (ingredientsUsed, heatingSurface, etc.).
     */
    executionPlan: BatchCookingExecutionStep[];
    /** Steps v2 du plan d'exécution (formalisme identique aux recipe steps v2). */
    executionStepsV2: RecipeV2StepDTO[];
}

export interface BatchCookingDraft {
    name: string;
    totalMeals: number;
    peopleCount: number;
    isDetailed: boolean;
    slots: BatchCookingSlot[];
    cuisineStyles: string[];
    equipment: string[];
    budgetTarget: BudgetTarget;
    excludedIngredients: string[];
    dietaryRestrictions: string[];
    timestamp: number;
}
