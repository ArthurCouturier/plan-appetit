import RecipeInterface from "../recipes/RecipeInterface";

export default interface RecipeCollectionInterface {
    uuid?: string;
    name: string;
    level: number;
    isPublic: boolean;
    isDefault: boolean;
    createdAt: string;
    lastUpdated: string;
    recipes?: RecipeInterface[];
    subCollections?: RecipeCollectionInterface[];
    parentCollection?: RecipeCollectionInterface | null;
}
