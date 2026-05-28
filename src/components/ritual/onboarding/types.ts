import type {
    CookingLevel,
} from "../../../api/interfaces/users/UserCulinaryProfileInterface";
import type { BudgetTarget } from "../../../api/interfaces/batchcooking/BatchCookingInterfaces";

export interface Draft {
    householdSize: number;
    dietaryRestrictions: string[];
    customRestrictions: string;
    budgetTarget: BudgetTarget;
    cookingLevel: CookingLevel;
    timeLunchWeekdayMin: number;
    timeDinnerWeekdayMin: number;
    ambitiousMeals: string[];
    equipment: string[];
    flavorPreferences: string[];
}

export const DEFAULT_DRAFT: Draft = {
    householdSize: 1,
    dietaryRestrictions: [],
    customRestrictions: "",
    budgetTarget: "BALANCED",
    cookingLevel: "INTERMEDIATE",
    timeLunchWeekdayMin: 20,
    timeDinnerWeekdayMin: 45,
    ambitiousMeals: [],
    equipment: ["Four", "Poêle", "Casserole"],
    flavorPreferences: [],
};

export function profileToDraft(p: {
    householdSize: number;
    dietaryRestrictions: string[];
    customRestrictions: string | null;
    budgetTarget: BudgetTarget;
    cookingLevel: CookingLevel;
    timeLunchWeekdayMin: number;
    timeDinnerWeekdayMin: number;
    ambitiousMeals: string[];
    equipment: string[];
    flavorPreferences: string[];
}): Draft {
    return {
        householdSize: p.householdSize,
        dietaryRestrictions: p.dietaryRestrictions,
        customRestrictions: p.customRestrictions ?? "",
        budgetTarget: p.budgetTarget,
        cookingLevel: p.cookingLevel,
        timeLunchWeekdayMin: p.timeLunchWeekdayMin,
        timeDinnerWeekdayMin: p.timeDinnerWeekdayMin,
        ambitiousMeals: p.ambitiousMeals,
        equipment: p.equipment,
        flavorPreferences: p.flavorPreferences,
    };
}
