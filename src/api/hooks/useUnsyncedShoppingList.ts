import { useEffect, useMemo, useState } from "react";
import {
    UnsyncedShoppingListMirror,
    getAllMirrors,
    getMirror,
    hasMirror,
    subscribeToMirrors,
} from "../offline/unsyncedShoppingLists";

function useMirrorRevision(): number {
    const [rev, setRev] = useState(0);
    useEffect(() => {
        return subscribeToMirrors(() => setRev((r) => r + 1));
    }, []);
    return rev;
}

export function useUnsyncedShoppingList(uuid: string | undefined): UnsyncedShoppingListMirror | null {
    const rev = useMirrorRevision();
    return useMemo(() => (uuid ? getMirror(uuid) : null), [uuid, rev]);
}

export function useIsListUnsynced(uuid: string | undefined): boolean {
    const rev = useMirrorRevision();
    return useMemo(() => (uuid ? hasMirror(uuid) : false), [uuid, rev]);
}

export function useAllUnsyncedMirrors(): UnsyncedShoppingListMirror[] {
    const rev = useMirrorRevision();
    return useMemo(() => getAllMirrors(), [rev]);
}
