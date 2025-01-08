import { UUIDTypes } from "uuid";
import IngredientInterface from "./IngredientInterface";
import { CourseEnum } from "../../enums/CourseEnum";
import { SeasonEnum } from "../../enums/SeasonEnum";

export default interface RecipeInterface {
    uuid: UUIDTypes;
    name: string;
    ingredients: IngredientInterface[];
    covers: number;
    buyPrice: number;
    sellPrice: number;
    promotion: number;
    course: CourseEnum;
    steps: Map<number, string>;
    season: SeasonEnum;
}
