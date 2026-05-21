import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryConfig";
import {
    ShoppingListInterface,
} from "../api/interfaces/shopping/ShoppingListInterface";
import {
    getMirror,
    setMirror,
    snapshotFromList,
} from "../api/offline/unsyncedShoppingLists";
import OfflineFallbackModal from "../components/shopping/OfflineFallbackModal";

export interface PendingOfflineOperation {
    listUuid: string;
    listName: string;
    /** Applies the failed operation to the local mirror (assumes a mirror exists). */
    retryLocally: () => void;
}

interface OfflineFallbackContextValue {
    triggerOffline: (op: PendingOfflineOperation) => void;
}

const OfflineFallbackContext = createContext<OfflineFallbackContextValue>({
    triggerOffline: () => {},
});

export function OfflineFallbackProvider({ children }: { children: ReactNode }) {
    const [pendingOp, setPendingOp] = useState<PendingOfflineOperation | null>(null);
    const qc = useQueryClient();

    const triggerOffline = useCallback((op: PendingOfflineOperation) => {
        setPendingOp(op);
    }, []);

    const goOffline = useCallback(() => {
        if (!pendingOp) return;
        const cached = qc.getQueryData<ShoppingListInterface>(
            queryKeys.shoppingLists.byId(pendingOp.listUuid),
        );
        if (!getMirror(pendingOp.listUuid)) {
            if (!cached) {
                // No cached state to snapshot — abort gracefully.
                setPendingOp(null);
                return;
            }
            setMirror(snapshotFromList(cached));
        }
        pendingOp.retryLocally();
        qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.byId(pendingOp.listUuid) });
        qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
        setPendingOp(null);
    }, [pendingOp, qc]);

    const cancel = useCallback(() => setPendingOp(null), []);

    const value = useMemo(() => ({ triggerOffline }), [triggerOffline]);

    return (
        <OfflineFallbackContext.Provider value={value}>
            {children}
            {pendingOp && (
                <OfflineFallbackModal
                    listName={pendingOp.listName}
                    onAccept={goOffline}
                    onCancel={cancel}
                />
            )}
        </OfflineFallbackContext.Provider>
    );
}

export function useOfflineFallback() {
    return useContext(OfflineFallbackContext);
}
