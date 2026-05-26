import type { BudgetTarget } from "../../../api/interfaces/batchcooking/BatchCookingInterfaces";
import type { CookingLevel } from "../../../api/interfaces/users/UserCulinaryProfileInterface";
import { DAY_LABEL, DAYS, MEAL_LABEL } from "./constants";

export function formatList(values: string[]): string {
    if (values.length === 0) return "Aucune préférence";
    if (values.length <= 3) return values.join(", ");
    return `${values.slice(0, 3).join(", ")} +${values.length - 3}`;
}

export function formatAmbitiousMeals(codes: string[]): string {
    if (codes.length === 0) return "Aucun";
    const grouped = new Map<string, string[]>();
    for (const code of codes) {
        const [day, meal] = code.split("_");
        const meals = grouped.get(day) ?? [];
        meals.push(meal);
        grouped.set(day, meals);
    }
    const ordered = sortDays(Array.from(grouped.keys()));
    return ordered
        .map((day) => {
            const meals = grouped.get(day)!.map((m) => MEAL_LABEL[m].toLowerCase()).join(" + ");
            return `${DAY_LABEL[day]} (${meals})`;
        })
        .join(", ");
}

export function budgetLabel(b: BudgetTarget): string {
    if (b === "ECONOMICAL") return "Éco (< 3 €)";
    if (b === "BALANCED") return "Équilibré (3-6 €)";
    return "Confort (6 € +)";
}

export function cookingLevelLabel(c: CookingLevel): string {
    if (c === "BEGINNER") return "Je débute";
    if (c === "INTERMEDIATE") return "Je sais faire pas mal de trucs";
    return "Je maîtrise";
}

export function sortDays(days: string[]): string[] {
    const order = Object.fromEntries(DAYS.map((d, i) => [d.code, i]));
    return [...days].sort((a, b) => order[a] - order[b]);
}

export function arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
}
