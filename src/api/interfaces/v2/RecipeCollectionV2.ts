import { RecipeV2CardSummaryDTO } from "./RecipeV2";

export interface RecipeCollectionV2BasicInfoDTO {
    uuid: string;
    name: string;
    level: number;
    isDefault: boolean;
    displayOrder: number;
    parentCollectionUuid: string | null;
}

export interface RecipeCollectionV2DTO {
    uuid: string;
    name: string;
    level: number;
    isDefault: boolean;
    isPublic: boolean;
    displayOrder: number;
    parentCollectionUuid: string | null;
    subCollections: RecipeCollectionV2BasicInfoDTO[];
    recipes: RecipeV2CardSummaryDTO[];
}
