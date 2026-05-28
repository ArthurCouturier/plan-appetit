export type ShoppingListType = "PERSONAL" | "SHARED";
export type ShoppingListMemberRole = "OWNER" | "MEMBER";

export const SHOPPING_LIST_NAME_MAX_LENGTH = 30;
export const SHOPPING_LIST_PERSONAL_NAME_MAX_LENGTH = 120;
export const SHOPPING_LIST_UNIT_CODE_MAX_LENGTH = 32;
export const SHOPPING_LIST_PERSONAL_ITEM_EMOJI = "📝";

export interface ShoppingListSummaryInterface {
    uuid: string;
    name: string;
    type: ShoppingListType;
    ownerUserUid: string;
    memberCount: number;
    itemCount: number;
    uncheckedCount: number;
    updatedAt: string;
}

export interface ShoppingListMemberInterface {
    userUid: string;
    email: string;
    displayName: string;
    profilePhoto: string | null;
    role: ShoppingListMemberRole;
    joinedAt: string;
}

export interface ShoppingListItemInterface {
    uuid: string;
    ingredientUuid: string | null;
    ingredientName: string | null;
    emoji: string;
    categoryCode: string;
    personalIngredientName: string | null;
    quantity: number | null;
    unitCode: string | null;
    checked: boolean;
    updatedAt: string;
    updatedByUid: string | null;
}

export interface ShoppingListInterface {
    uuid: string;
    name: string;
    type: ShoppingListType;
    ownerUserUid: string;
    inviteToken: string;
    createdAt: string;
    updatedAt: string;
    items: ShoppingListItemInterface[];
    members: ShoppingListMemberInterface[];
    /** SHA-256 hex de l'état canonique de la liste, pour détecter une divergence après event SSE. */
    checksum: string;
}

export type ShoppingListSseEventType = "LIST_UPDATED" | "LIST_DELETED";

export interface ShoppingListSseEvent {
    type: ShoppingListSseEventType;
    listUuid: string;
    checksum: string | null;
    occurredAt: string;
}

export interface AddShoppingListMemberRequest {
    email: string;
}

export interface CreateShoppingListRequest {
    name?: string;
    type?: ShoppingListType;
}

export interface UpdateShoppingListRequest {
    name?: string;
}

export interface CreateShoppingListItemRequest {
    ingredientUuid?: string | null;
    personalIngredientName?: string | null;
    quantity?: number | null;
    unitCode?: string | null;
}

export interface UpdateShoppingListItemRequest {
    ingredientUuid?: string | null;
    personalIngredientName?: string | null;
    quantity?: number | null;
    unitCode?: string | null;
    checked?: boolean;
}

export interface ReconcileShoppingListItem {
    uuid: string;
    ingredientUuid?: string | null;
    personalIngredientName?: string | null;
    quantity?: number | null;
    unitCode?: string | null;
    checked: boolean;
}

export interface ReconcileShoppingListRequest {
    name?: string;
    items: ReconcileShoppingListItem[];
}

export interface IngredientSuggestionInterface {
    uuid: string;
    name: string;
    emoji: string;
    categoryCode: string;
    primaryUnitCode: string;
}

export function shoppingListItemDisplayName(item: ShoppingListItemInterface): string {
    return item.ingredientName ?? item.personalIngredientName ?? "";
}
