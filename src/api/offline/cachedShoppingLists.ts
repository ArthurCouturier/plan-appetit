import {
    ShoppingListInterface,
    ShoppingListSummaryInterface,
} from "../interfaces/shopping/ShoppingListInterface";

const SUMMARIES_KEY = "cachedShoppingListSummaries";
const DETAILS_KEY = "cachedShoppingListDetails";

function safeRead<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

function safeWrite(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Quota or storage unavailable — ignore silently. Cache is best-effort.
    }
}

export function getCachedSummaries(): ShoppingListSummaryInterface[] | null {
    return safeRead<ShoppingListSummaryInterface[]>(SUMMARIES_KEY);
}

export function setCachedSummaries(summaries: ShoppingListSummaryInterface[]): void {
    safeWrite(SUMMARIES_KEY, summaries);
}

type DetailsStore = Record<string, ShoppingListInterface>;

export function getCachedList(uuid: string): ShoppingListInterface | null {
    const store = safeRead<DetailsStore>(DETAILS_KEY) ?? {};
    return store[uuid] ?? null;
}

export function setCachedList(list: ShoppingListInterface): void {
    const store = safeRead<DetailsStore>(DETAILS_KEY) ?? {};
    store[list.uuid] = list;
    safeWrite(DETAILS_KEY, store);
}

export function deleteCachedList(uuid: string): void {
    const store = safeRead<DetailsStore>(DETAILS_KEY) ?? {};
    if (uuid in store) {
        delete store[uuid];
        safeWrite(DETAILS_KEY, store);
    }
    const summaries = getCachedSummaries();
    if (summaries) {
        setCachedSummaries(summaries.filter((s) => s.uuid !== uuid));
    }
}

/** Drop cached details for UUIDs no longer present in the summaries list. */
export function syncDetailsCacheWithSummaries(summaries: ShoppingListSummaryInterface[]): void {
    const validUuids = new Set(summaries.map((s) => s.uuid));
    const store = safeRead<DetailsStore>(DETAILS_KEY) ?? {};
    let changed = false;
    for (const uuid of Object.keys(store)) {
        if (!validUuids.has(uuid)) {
            delete store[uuid];
            changed = true;
        }
    }
    if (changed) safeWrite(DETAILS_KEY, store);
}
