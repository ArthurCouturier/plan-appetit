import { UUIDTypes } from "uuid";
import IngredientInterface from "./IngredientInterface";
import { CourseEnum } from "../../enums/CourseEnum";
import { SeasonEnum } from "../../enums/SeasonEnum";
import StepInterface from "./StepInterface";

export default interface RecipeInterface {
    uuid: UUIDTypes;
    name: string;
    ingredients: IngredientInterface[];
    covers: number;
    buyPrice: number;
    sellPrice: number;
    promotion: number;
    course: CourseEnum;
    steps: StepInterface[];
    season: SeasonEnum;
}
