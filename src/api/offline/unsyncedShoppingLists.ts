import {
    ShoppingListInterface,
    ShoppingListItemInterface,
    ShoppingListMemberInterface,
    ShoppingListSummaryInterface,
    ShoppingListType,
} from "../interfaces/shopping/ShoppingListInterface";

const STORAGE_KEY = "unsyncedShoppingLists";

export interface UnsyncedShoppingListMirror {
    sourceUuid: string;
    name: string;
    type: ShoppingListType;
    ownerUserUid: string;
    inviteToken: string;
    checksum: string;
    createdAt: string;
    members: ShoppingListMemberInterface[];
    items: ShoppingListItemInterface[];
    deletedItemUuids: string[];
    switchedAt: string;
}

type Store = Record<string, UnsyncedShoppingListMirror>;

function readStore(): Store {
    if (typeof window === "undefined") return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

type Listener = () => void;
const listeners = new Set<Listener>();

function notifyChange(): void {
    for (const l of listeners) l();
}

export function subscribeToMirrors(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function writeStore(store: Store): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    notifyChange();
}

export function getMirror(sourceUuid: string): UnsyncedShoppingListMirror | null {
    return readStore()[sourceUuid] ?? null;
}

export function getAllMirrors(): UnsyncedShoppingListMirror[] {
    return Object.values(readStore());
}

export function hasMirror(sourceUuid: string): boolean {
    return !!readStore()[sourceUuid];
}

export function snapshotFromList(list: ShoppingListInterface): UnsyncedShoppingListMirror {
    return {
        sourceUuid: list.uuid,
        name: list.name,
        type: list.type,
        ownerUserUid: list.ownerUserUid,
        inviteToken: list.inviteToken,
        checksum: list.checksum,
        createdAt: list.createdAt,
        members: list.members.map((m) => ({ ...m })),
        items: list.items.map((it) => ({ ...it })),
        deletedItemUuids: [],
        switchedAt: new Date().toISOString(),
    };
}

export function setMirror(mirror: UnsyncedShoppingListMirror): void {
    const store = readStore();
    store[mirror.sourceUuid] = mirror;
    writeStore(store);
}

export function deleteMirror(sourceUuid: string): void {
    const store = readStore();
    delete store[sourceUuid];
    writeStore(store);
}

export function mirrorToListInterface(mirror: UnsyncedShoppingListMirror): ShoppingListInterface {
    return {
        uuid: mirror.sourceUuid,
        name: mirror.name,
        type: mirror.type,
        ownerUserUid: mirror.ownerUserUid,
        inviteToken: mirror.inviteToken ?? "",
        checksum: mirror.checksum ?? "",
        createdAt: mirror.createdAt,
        updatedAt: mirror.switchedAt,
        items: mirror.items,
        members: mirror.members,
    };
}

export function mirrorToSummary(mirror: UnsyncedShoppingListMirror): ShoppingListSummaryInterface {
    return {
        uuid: mirror.sourceUuid,
        name: mirror.name,
        type: mirror.type,
        ownerUserUid: mirror.ownerUserUid,
        memberCount: mirror.members.length,
        itemCount: mirror.items.length,
        uncheckedCount: mirror.items.filter((it) => !it.checked).length,
        updatedAt: mirror.switchedAt,
    };
}

export function applyAddItem(
    mirror: UnsyncedShoppingListMirror,
    item: ShoppingListItemInterface,
): UnsyncedShoppingListMirror {
    return { ...mirror, items: [...mirror.items, item] };
}

export function applyUpdateItem(
    mirror: UnsyncedShoppingListMirror,
    itemUuid: string,
    patch: Partial<ShoppingListItemInterface>,
): UnsyncedShoppingListMirror {
    return {
        ...mirror,
        items: mirror.items.map((it) =>
            it.uuid === itemUuid
                ? { ...it, ...patch, updatedAt: new Date().toISOString() }
                : it,
        ),
    };
}

export function applyDeleteItem(
    mirror: UnsyncedShoppingListMirror,
    itemUuid: string,
): UnsyncedShoppingListMirror {
    return {
        ...mirror,
        items: mirror.items.filter((it) => it.uuid !== itemUuid),
        deletedItemUuids: Array.from(new Set([...mirror.deletedItemUuids, itemUuid])),
    };
}

export function applyRename(
    mirror: UnsyncedShoppingListMirror,
    newName: string,
): UnsyncedShoppingListMirror {
    return { ...mirror, name: newName };
}

export interface ReconcileConflict {
    uuid: string;
    local: ShoppingListItemInterface;
    remote: ShoppingListItemInterface;
}

export interface ReconcileDiff {
    nameConflict: { local: string; remote: string } | null;
    itemConflicts: ReconcileConflict[];
    localOnly: ShoppingListItemInterface[];
    remoteOnly: ShoppingListItemInterface[];
    localDeleted: ShoppingListItemInterface[];
    unchanged: ShoppingListItemInterface[];
}

function itemFieldsEqual(a: ShoppingListItemInterface, b: ShoppingListItemInterface): boolean {
    return (
        a.ingredientUuid === b.ingredientUuid
        && (a.personalIngredientName ?? "") === (b.personalIngredientName ?? "")
        && Number(a.quantity ?? 0) === Number(b.quantity ?? 0)
        && (a.unitCode ?? "") === (b.unitCode ?? "")
        && a.checked === b.checked
    );
}

export function computeDiff(
    mirror: UnsyncedShoppingListMirror,
    remote: ShoppingListInterface,
): ReconcileDiff {
    const localByUuid = new Map(mirror.items.map((it) => [it.uuid, it]));
    const remoteByUuid = new Map(remote.items.map((it) => [it.uuid, it]));
    const deletedSet = new Set(mirror.deletedItemUuids);

    const itemConflicts: ReconcileConflict[] = [];
    const localOnly: ShoppingListItemInterface[] = [];
    const remoteOnly: ShoppingListItemInterface[] = [];
    const localDeleted: ShoppingListItemInterface[] = [];
    const unchanged: ShoppingListItemInterface[] = [];

    for (const local of mirror.items) {
        const remoteIt = remoteByUuid.get(local.uuid);
        if (!remoteIt) {
            localOnly.push(local);
        } else if (!itemFieldsEqual(local, remoteIt)) {
            itemConflicts.push({ uuid: local.uuid, local, remote: remoteIt });
        } else {
            unchanged.push(local);
        }
    }

    for (const remoteIt of remote.items) {
        if (localByUuid.has(remoteIt.uuid)) continue;
        if (deletedSet.has(remoteIt.uuid)) {
            localDeleted.push(remoteIt);
        } else {
            remoteOnly.push(remoteIt);
        }
    }

    const nameConflict = mirror.name !== remote.name
        ? { local: mirror.name, remote: remote.name }
        : null;

    return { nameConflict, itemConflicts, localOnly, remoteOnly, localDeleted, unchanged };
}
