export type ShoppingSource = "MANUAL" | "RITUAL_RECIPE";
export type ShoppingRecurrence = "ONCE" | "WEEKLY" | "BIWEEKLY" | "MONTHLY";

export interface RitualShoppingItemInterface {
    uuid: string;
    name: string;
    quantity: number | null;
    unit: string | null;
    source: ShoppingSource;
    sourceRecipeUuid: string | null;
    recurrence: ShoppingRecurrence;
    cycleDayOfWeek: number;
    checked: boolean;
}

export interface CreateShoppingItemRequest {
    name: string;
    quantity?: number;
    unit?: string;
    recurrence?: ShoppingRecurrence;
    cycleDayOfWeek?: number;
}

export interface UpdateShoppingItemRequest {
    name?: string;
    quantity?: number;
    unit?: string;
    recurrence?: ShoppingRecurrence;
    cycleDayOfWeek?: number;
    checked?: boolean;
}

export const SHOPPING_ITEM_NAME_MAX_LENGTH = 120;
export const SHOPPING_ITEM_UNIT_MAX_LENGTH = 32;
