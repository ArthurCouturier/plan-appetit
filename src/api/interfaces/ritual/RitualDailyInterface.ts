export type MealType = "LUNCH" | "DINNER" | "UNSPECIFIED";

export interface RitualDailyInterface {
    assignmentUuid: string;
    recipeUuid: string;
    recipeName: string;
    mealType: MealType;
    date: string;
    covers: number;
    totalTimeMin: number | null;
    restTimeMin: number | null;
    buyPrice: number;
    isPublic: boolean;
    creationDate: string | null;
}

export interface RegenerateRitualDailyRequest {
    mealType: MealType;
    date?: string;
    reason?: string;
}

export const REGENERATION_REASON_MAX_LENGTH = 200;

export type RitualDailyError =
    | "UNAUTHORIZED"
    | "PROFILE_MISSING"
    | "INSUFFICIENT_CREDITS"
    | "UNKNOWN";

export class RitualDailyServiceError extends Error {
    constructor(public code: RitualDailyError, message: string) {
        super(message);
    }
}
