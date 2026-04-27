/**
 * Returns true if the value is a non-empty string that isn't the literal
 * "null"/"undefined" string (legacy data from older v0 generations sometimes
 * persisted those tokens instead of a SQL NULL).
 */
export function isMeaningfulText(value: string | null | undefined): value is string {
    if (value === null || value === undefined) return false;
    const trimmed = value.trim().toLowerCase();
    if (trimmed.length === 0) return false;
    return trimmed !== "null" && trimmed !== "undefined";
}
