import { RitualDailyInterface } from "../interfaces/ritual/RitualDailyInterface";
import RecipeSummaryInterface from "../interfaces/recipes/RecipeSummaryInterface";

export function ritualDailyToRecipeSummary(d: RitualDailyInterface): RecipeSummaryInterface {
    return {
        uuid: d.recipeUuid,
        name: d.recipeName,
        covers: d.covers,
        buyPrice: d.buyPrice,
        isPublic: d.isPublic,
        displayOrder: 0,
        totalTimeMin: d.totalTimeMin,
        restTimeMin: d.restTimeMin,
        creationDate: d.creationDate,
    };
}
