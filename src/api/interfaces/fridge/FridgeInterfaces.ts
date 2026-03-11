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
}

export interface FridgeQuestionsRequest {
    ingredients: string;
    servings: number;
    timeCategory: string;
}

export interface FridgeShoppingRequest {
    ingredients: string;
    servings: number;
    timeCategory: string;
    answers: Record<string, unknown>;
}

export interface FridgeGenerateRequest {
    ingredients: string;
    servings: number;
    timeCategory: string;
    answers: Record<string, unknown>;
    shoppingAccepted: boolean;
    shoppingItems: string[];
}

export type TimeCategory = "express" | "normal" | "long";

export interface FridgeDraft {
    ingredients: string;
    servings: number;
    timeCategory: TimeCategory;
    timestamp: number;
}
