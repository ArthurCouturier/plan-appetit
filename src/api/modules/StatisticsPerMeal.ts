import { MealInterface } from "../interfaces/ConfigurationInterface";


export function getTotalOfTheMeal(meal: MealInterface): number {
    return meal.covers * (meal.drinkPrice + meal.mainCoursePrice);
}

export function getAverageOfTheMeal(meal: MealInterface): number {
    return meal.mainCoursePrice + meal.drinkPrice;
}
