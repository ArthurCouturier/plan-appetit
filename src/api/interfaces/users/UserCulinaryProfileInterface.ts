import type { BudgetTarget } from "../batchcooking/BatchCookingInterfaces";

export type CookingLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
export type AmbitiousMealCode = `${DayOfWeek}_LUNCH` | `${DayOfWeek}_DINNER`;

export interface UserCulinaryProfileInterface {
    householdSize: number;
    dietaryRestrictions: string[];
    customRestrictions: string | null;
    budgetTarget: BudgetTarget;
    cookingLevel: CookingLevel;
    timeLunchWeekdayMin: number;
    timeDinnerWeekdayMin: number;
    ambitiousMeals: string[];
    equipment: string[];
    equipmentCustom: string | null;
    flavorPreferences: string[];
    notifTime1: string;
    notifTime2: string;
    notifsEnabled: boolean;
    notifsLunchEnabled: boolean;
    notifsDinnerEnabled: boolean;
    onboardingCompletedAt: string | null;
}

export interface UpdateUserCulinaryProfileRequest {
    householdSize?: number;
    dietaryRestrictions?: string[];
    customRestrictions?: string;
    budgetTarget?: BudgetTarget;
    cookingLevel?: CookingLevel;
    timeLunchWeekdayMin?: number;
    timeDinnerWeekdayMin?: number;
    ambitiousMeals?: string[];
    equipment?: string[];
    equipmentCustom?: string;
    flavorPreferences?: string[];
    notifTime1?: string;
    notifTime2?: string;
    notifsEnabled?: boolean;
    notifsLunchEnabled?: boolean;
    notifsDinnerEnabled?: boolean;
}
