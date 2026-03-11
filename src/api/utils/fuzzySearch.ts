import { FRIDGE_INGREDIENTS, type FridgeIngredient } from "../../data/fridgeIngredients";

function normalizeString(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function computeScore(query: string, target: string): number {
    const normalizedQuery = normalizeString(query);
    const normalizedTarget = normalizeString(target);

    if (normalizedTarget === normalizedQuery) return 0;
    if (normalizedTarget.startsWith(normalizedQuery)) return 1;
    if (normalizedTarget.includes(normalizedQuery)) return 2;

    let score = 0;
    let queryIdx = 0;
    for (let i = 0; i < normalizedTarget.length && queryIdx < normalizedQuery.length; i++) {
        if (normalizedTarget[i] === normalizedQuery[queryIdx]) {
            queryIdx++;
        }
    }
    if (queryIdx === normalizedQuery.length) {
        score = 3 + (normalizedTarget.length - normalizedQuery.length);
        return score;
    }

    const distance = levenshteinDistance(normalizedQuery, normalizedTarget);
    const maxLen = Math.max(normalizedQuery.length, normalizedTarget.length);
    const similarity = 1 - distance / maxLen;

    if (similarity >= 0.4) {
        return 10 + distance;
    }

    return Infinity;
}

function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= a.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[a.length][b.length];
}

export function searchIngredients(query: string, limit: number = 5): FridgeIngredient[] {
    const trimmed = query.trim();
    if (trimmed.length === 0) return [];

    const scored = FRIDGE_INGREDIENTS
        .map((ingredient) => ({
            ingredient,
            score: computeScore(trimmed, ingredient.name),
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
