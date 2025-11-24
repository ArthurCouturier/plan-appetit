import RecipeSummaryInterface from "../recipes/RecipeSummaryInterface";

export default interface RecipeCollectionInterface {
    uuid?: string;
    name: string;
    level: number;
    isPublic: boolean;
    isDefault: boolean;
    createdAt: string;
    lastUpdated: string;
    recipes?: RecipeSummaryInterface[];
    subCollections?: RecipeCollectionInterface[];
}
