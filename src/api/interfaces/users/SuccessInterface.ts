export default interface SuccessInterface {
    uuid: string;
    generateOneRecipe: boolean;
    generateOneLocationRecipe: boolean;
    generateOneMultiRecipe: boolean;
    exportOneRecipe: boolean;
    generateOneBatchCooking: boolean;
    generateTenRecipes: boolean;
    generateHundredRecipes: boolean;
    generateOneRecipeAt: string | null;
    generateOneLocationRecipeAt: string | null;
    generateOneMultiRecipeAt: string | null;
    exportOneRecipeAt: string | null;
    generateOneBatchCookingAt: string | null;
    generateTenRecipesAt: string | null;
    generateHundredRecipesAt: string | null;
    totalCreditsEarned: number;
    createdAt: string;
    updatedAt: string;
}

export interface SuccessClaimResponse {
    success: boolean;
    message: string;
    creditsAwarded: number;
    alreadyClaimed: boolean;
    totalCreditsEarned: number;
}

export enum SuccessType {
    GENERATE_ONE_RECIPE = "GENERATE_ONE_RECIPE",
    GENERATE_ONE_LOCATION_RECIPE = "GENERATE_ONE_LOCATION_RECIPE",
    GENERATE_ONE_MULTI_RECIPE = "GENERATE_ONE_MULTI_RECIPE",
    EXPORT_ONE_RECIPE = "EXPORT_ONE_RECIPE",
    GENERATE_ONE_BATCH_COOKING = "GENERATE_ONE_BATCH_COOKING",
    GENERATE_TEN_RECIPES = "GENERATE_TEN_RECIPES",
    GENERATE_HUNDRED_RECIPES = "GENERATE_HUNDRED_RECIPES"
}
