import { SeasonEnum } from "../../enums/SeasonEnum";

export default interface RecipeGenerationParametersInterface {
    localisation: string;
    seasons: SeasonEnum[];
    ingredients: string;
    book: boolean;
    allergens: string;
}