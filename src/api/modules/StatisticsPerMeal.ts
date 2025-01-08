import MealInterface from "../interfaces/MealInterface";


export function getTotalOfTheMeal(meal: MealInterface): number {
    return meal.covers * (meal.drinkPrice + meal.starterPrice + meal.mainCoursePrice + meal.dessertPrice);
}

export function getTotalAverage(meal: MealInterface): number {
    return meal.starterPrice + meal.mainCoursePrice + meal.dessertPrice + meal.drinkPrice;
}
