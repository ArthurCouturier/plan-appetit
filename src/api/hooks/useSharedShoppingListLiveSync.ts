import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryConfig";
import ShoppingListService from "../services/ShoppingListService";
import {
    ShoppingListInterface,
    ShoppingListSseEvent,
} from "../interfaces/shopping/ShoppingListInterface";
import useAuth from "./useAuth";

export type LiveSyncStatus = "off" | "connecting" | "connected" | "reconnecting";

interface UseSharedShoppingListLiveSyncResult {
    status: LiveSyncStatus;
}

/**
 * Ouvre une connexion SSE pour pousser les changements de la liste en temps réel.
 * - Active uniquement pour les listes SHARED.
 * - Compare le checksum reçu avec celui en cache. Si divergence → invalidate la query
 *   ce qui déclenche un refetch (latest server state).
 * - Reconnexion auto (gérée par SseClient). Sur reconnexion, on force aussi un refetch
 *   pour combler les events ratés pendant le downtime.
 * - Indicateur de statut (status) pour l'UI.
 *
 * Non bloquant : si SSE échoue, la liste reste consultable et éditable via les flows
 * standards (cache, mirror offline, reconcile).
 */
export function useSharedShoppingListLiveSync(
    list: ShoppingListInterface | undefined,
): UseSharedShoppingListLiveSyncResult {
    const { user } = useAuth();
    const qc = useQueryClient();
    const [status, setStatus] = useState<LiveSyncStatus>("off");
    const currentChecksumRef = useRef<string | null>(null);

    useEffect(() => {
        currentChecksumRef.current = list?.checksum ?? null;
    }, [list?.checksum]);

    const listUuid = list?.uuid;
    // Subscribe pour toute liste (pas seulement SHARED) afin de capter la transition
    // PERSONAL→SHARED quand l'owner avait déjà la liste ouverte avant d'inviter qqn.
    // Coût négligeable : socket idle, aucun event ne flue tant que personne ne modifie.
    const shouldConnect = !!user && !!list && !!listUuid;

    useEffect(() => {
        if (!shouldConnect || !listUuid) {
            setStatus("off");
            return;
        }
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("firebaseIdToken");
        if (!email || !token) return;

        setStatus("connecting");
        const controller = ShoppingListService.subscribeEvents(email, token, listUuid, {
            onOpen: () => {
                setStatus("connected");
                // Force refetch à la (re)connexion pour combler les events ratés pendant un éventuel downtime
                qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.byId(listUuid) });
            },
            onMessage: (msg) => {
                if (typeof msg.data !== "object" || msg.data === null) return;
                const event = msg.data as ShoppingListSseEvent;
                if (event.type === "LIST_DELETED") {
                    qc.removeQueries({ queryKey: queryKeys.shoppingLists.byId(listUuid) });
                    qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.all() });
                    return;
                }
                if (event.type === "LIST_UPDATED") {
                    const localChecksum = currentChecksumRef.current;
                    if (event.checksum && event.checksum !== localChecksum) {
                        qc.invalidateQueries({ queryKey: queryKeys.shoppingLists.byId(listUuid) });
                    }
                }
            },
            onError: () => {
                setStatus("reconnecting");
            },
            onClose: () => {
                setStatus("off");
            },
        });

        return () => {
            controller.abort();
        };
    }, [shouldConnect, listUuid, qc]);

    return { status };
}
