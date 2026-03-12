export interface FridgeQuestion {
    id: string;
    type: "slider" | "level" | "boolean" | "choice";
    label: string;
    emoji: string;
    min?: number;
    max?: number;
    plusLabel?: string;
    options?: string[];
}

export interface FridgeQuestionsResponse {
    questions: FridgeQuestion[];
}

export interface FridgeShoppingItem {
    name: string;
    emoji: string;
    priceCents: number;
    unlockLabel: string;
}

export interface FridgeShoppingResponse {
    shoppingNeeded: boolean;
    canCookNow: number;
    canCookWithShopping: number;
    items: FridgeShoppingItem[];
    recipesWithoutShopping: string[];
    recipesWithShopping: string[];
}

export interface FridgeQuestionsRequest {
    ingredients: string;
    servings: number;
    timeCategory: string;
}

export interface FridgeQuestionContext {
    id: string;
    label: string;
    emoji: string;
}

export interface FridgeShoppingRequest {
    ingredients: string;
    servings: number;
    timeCategory: string;
    answers: Record<string, unknown>;
    questions: FridgeQuestionContext[];
}

export interface FridgeGenerateRequest {
    ingredients: string;
    servings: number;
    timeCategory: string;
    answers: Record<string, unknown>;
    questions: FridgeQuestionContext[];
    shoppingAccepted: boolean;
    shoppingItems: string[];
    selectedRecipeTitle: string;
}

export type TimeCategory = "express" | "normal" | "long";

export interface FridgeDraft {
    ingredients: string;
    servings: number;
    timeCategory: TimeCategory;
    timestamp: number;
}
