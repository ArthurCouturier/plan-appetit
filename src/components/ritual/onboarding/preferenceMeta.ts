import { Draft } from "./types";
import {
    budgetLabel,
    cookingLevelLabel,
    formatAmbitiousMeals,
    formatList,
} from "./labels";

export type PreferenceKey =
    | "household"
    | "restrictions"
    | "budget"
    | "cookingLevel"
    | "timeLunch"
    | "timeDinner"
    | "ambitiousMeals"
    | "equipment"
    | "flavors";

export interface PreferenceMeta {
    key: PreferenceKey;
    label: string;
    formatValue: (draft: Draft) => string;
}

export const PREFERENCE_META: PreferenceMeta[] = [
    {
        key: "household",
        label: "Personnes à table",
        formatValue: (d) => (d.householdSize === 6 ? "6+" : String(d.householdSize)),
    },
    {
        key: "restrictions",
        label: "Restrictions / allergies",
        formatValue: (d) =>
            formatList([...d.dietaryRestrictions, d.customRestrictions.trim()].filter(Boolean)),
    },
    {
        key: "budget",
        label: "Budget",
        formatValue: (d) => budgetLabel(d.budgetTarget),
    },
    {
        key: "cookingLevel",
        label: "Niveau cuisine",
        formatValue: (d) => cookingLevelLabel(d.cookingLevel),
    },
    {
        key: "timeLunch",
        label: "Temps midi semaine",
        formatValue: (d) => `${d.timeLunchWeekdayMin} min`,
    },
    {
        key: "timeDinner",
        label: "Temps soir semaine",
        formatValue: (d) => `${d.timeDinnerWeekdayMin} min`,
    },
    {
        key: "ambitiousMeals",
        label: "Repas ambitieux",
        formatValue: (d) => formatAmbitiousMeals(d.ambitiousMeals),
    },
    {
        key: "equipment",
        label: "Équipement",
        formatValue: (d) => formatList(d.equipment),
    },
    {
        key: "flavors",
        label: "Saveurs préférées",
        formatValue: (d) => formatList(d.flavorPreferences),
    },
];

export function preferenceMetaByKey(key: string): PreferenceMeta | null {
    return PREFERENCE_META.find((m) => m.key === key) ?? null;
}
