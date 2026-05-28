import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "activeShoppingListUuid";

function readStored(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
}

export function useActiveShoppingList() {
    const [activeUuid, setActiveUuidState] = useState<string | null>(() => readStored());

    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) setActiveUuidState(e.newValue);
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, []);

    const setActiveUuid = useCallback((uuid: string | null) => {
        if (uuid) {
            localStorage.setItem(STORAGE_KEY, uuid);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }
        setActiveUuidState(uuid);
    }, []);

    return { activeUuid, setActiveUuid };
}
