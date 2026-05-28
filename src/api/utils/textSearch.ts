export function normalizeString(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");
}

export function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= a.length; i++) matrix[i] = [i];
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost,
            );
        }
    }
    return matrix[a.length][b.length];
}

/**
 * Score: lower is better. Infinity = no match.
 * - 0 exact, 1 startsWith, 2 includes, 3+ subsequence (penalty by remaining chars),
 *   10+ levenshtein when similarity ≥ minSimilarity, Infinity otherwise.
 */
export function computeMatchScore(
    query: string,
    target: string,
    minSimilarity = 0.4,
): number {
    const q = normalizeString(query);
    const t = normalizeString(target);
    if (q.length === 0) return 0;
    if (t === q) return 0;
    if (t.startsWith(q)) return 1;
    if (t.includes(q)) return 2;

    let queryIdx = 0;
    for (let i = 0; i < t.length && queryIdx < q.length; i++) {
        if (t[i] === q[queryIdx]) queryIdx++;
    }
    if (queryIdx === q.length) {
        return 3 + (t.length - q.length);
    }

    const distance = levenshteinDistance(q, t);
    const maxLen = Math.max(q.length, t.length);
    const similarity = 1 - distance / maxLen;
    if (similarity >= minSimilarity) {
        return 10 + distance;
    }
    return Infinity;
}

export interface ScoredItem<T> {
    item: T;
    score: number;
}

/**
 * Filter + sort a list by relevance to query (best first).
 * Empty query returns the original list.
 */
export function fuzzyFilter<T>(
    items: T[],
    query: string,
    getText: (item: T) => string,
    minSimilarity = 0.4,
): T[] {
    const trimmed = query.trim();
    if (trimmed.length === 0) return items;
    const scored: ScoredItem<T>[] = items
        .map((item) => ({ item, score: computeMatchScore(trimmed, getText(item), minSimilarity) }))
        .filter((s) => s.score !== Infinity)
        .sort((a, b) => a.score - b.score);
    return scored.map((s) => s.item);
}
