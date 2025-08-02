import { IngredientCategoryEnum } from "../enums/IngredientCategoryEnum";

export const IngredientCategoryLabels: Record<IngredientCategoryEnum, string> = {
    [IngredientCategoryEnum.MEAT]: "Viande",
    [IngredientCategoryEnum.FISH]: "Poisson",
    [IngredientCategoryEnum.VEGETABLE]: "Légumes",
    [IngredientCategoryEnum.FRUIT]: "Fruits",
    [IngredientCategoryEnum.DAIRY]: "Produits laitiers",
    [IngredientCategoryEnum.CEREAL]: "Céréale",
    [IngredientCategoryEnum.SPECIES]: "Épices",
    [IngredientCategoryEnum.OTHER]: "Autre"
};
