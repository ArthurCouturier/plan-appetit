import { FRIDGE_INGREDIENTS, type FridgeIngredient } from "../../data/fridgeIngredients";
import { computeMatchScore } from "./textSearch";

export function searchIngredients(query: string, limit: number = 5): FridgeIngredient[] {
    const trimmed = query.trim();
    if (trimmed.length === 0) return [];

    const scored = FRIDGE_INGREDIENTS
        .map((ingredient) => ({
            ingredient,
            score: computeMatchScore(trimmed, ingredient.name),
        }))
        .filter((item) => item.score !== Infinity)
        .sort((a, b) => a.score - b.score);

    return scored.slice(0, limit).map((item) => item.ingredient);
}

export function extractCurrentWord(text: string): { word: string; startIndex: number } {
    const lastSpaceIndex = text.lastIndexOf(" ");
    if (lastSpaceIndex === -1) {
        return { word: text, startIndex: 0 };
    }
    return { word: text.substring(lastSpaceIndex + 1), startIndex: lastSpaceIndex + 1 };
}

export function replaceCurrentWord(text: string, replacement: string): string {
    const { startIndex } = extractCurrentWord(text);
    return text.substring(0, startIndex) + replacement;
}
