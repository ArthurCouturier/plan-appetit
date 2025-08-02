import { IngredientCategoryEnum } from "../../enums/IngredientCategoryEnum";
import { SeasonEnum } from "../../enums/SeasonEnum";
import QuantityInterface from "./QuantityInterface";

export default interface IngredientInterface {
    name: string;
    category: IngredientCategoryEnum;
    season: SeasonEnum[];
    quantity: QuantityInterface;
}
