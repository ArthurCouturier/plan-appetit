import { MealType } from "./RitualDailyInterface";

export interface RitualMealPlanEntryInterface {
    uuid: string;
    date: string;
    mealType: MealType;
    recipeUuid: string | null;
    recipeName: string | null;
    customText: string | null;
    isSkipped: boolean;
}

export interface RitualMealPlanWeekInterface {
    from: string;
    to: string;
    entries: RitualMealPlanEntryInterface[];
}

export interface UpsertMealPlanEntryRequest {
    date: string;
    mealType: MealType;
    recipeUuid?: string;
    customText?: string;
    isSkipped?: boolean;
}
