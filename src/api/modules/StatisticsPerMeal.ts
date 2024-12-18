import { MealProps } from "../ConfigurationInterface";


export function getTotalOfTheMeal(meal: MealProps): number {
    return meal.covers * (meal.drinkPrice + meal.lunchPrice);
}

export function getAverageOfTheMeal(meal: MealProps): number {
    return meal.lunchPrice + meal.drinkPrice;
}
