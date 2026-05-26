export const NONE_RESTRICTION = "Aucune restriction";
export const TIME_STEPS = [5, 10, 15, 20, 30, 45, 60, 90, 120];
export const TOTAL_QUESTIONS = 9;

export const DAYS: { code: string; label: string }[] = [
    { code: "MON", label: "Lundi" },
    { code: "TUE", label: "Mardi" },
    { code: "WED", label: "Mercredi" },
    { code: "THU", label: "Jeudi" },
    { code: "FRI", label: "Vendredi" },
    { code: "SAT", label: "Samedi" },
    { code: "SUN", label: "Dimanche" },
];
export const DEFAULT_AMBITIOUS_DAYS = ["SAT", "SUN"];
export const MEAL_CODES = ["LUNCH", "DINNER"] as const;
export const MEAL_LABEL: Record<string, string> = { LUNCH: "Midi", DINNER: "Soir" };
export const DAY_LABEL: Record<string, string> = Object.fromEntries(DAYS.map((d) => [d.code, d.label]));
