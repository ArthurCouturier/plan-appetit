import RecipeSummaryInterface from "../recipes/RecipeSummaryInterface";

export default interface RecipeCollectionInterface {
    uuid?: string;
    name: string;
    level: number;
    isPublic: boolean;
    isDefault: boolean;
    displayOrder: number;
    createdAt: string;
    lastUpdated: string;
    parentCollectionUuid?: string | null;
    parentCollectionName?: string | null;
    recipes?: RecipeSummaryInterface[];
    subCollections?: RecipeCollectionInterface[];
}
