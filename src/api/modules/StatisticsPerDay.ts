import { DayInterface } from "../interfaces/ConfigurationInterface";

function getTotalNbOfCoversOfTheDay(day: DayInterface): number {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers;
    });
    return total;
}

export function getTotalOfTheDay(day: DayInterface): number {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * (meal.mainCoursePrice + meal.drinkPrice);
    });
    return total;
}

export function getTotalDrinkOfTheDay(day: DayInterface): number {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * meal.drinkPrice;
    });
    return total;
}

export function getTotalLunchOfTheDay(day: DayInterface): number {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * meal.mainCoursePrice;
    });
    return total;
}

export function getAverageBasketPerDay(day: DayInterface): string {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * (meal.mainCoursePrice + meal.drinkPrice);
    });
    return (total / getTotalNbOfCoversOfTheDay(day)).toFixed(2);
}

export function getAverageDrinkBasketPerDay(day: DayInterface): string {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * meal.drinkPrice;
    });
    return (total / getTotalNbOfCoversOfTheDay(day)).toFixed(2);
}

export function getAverageLunchBasketPerDay(day: DayInterface): string {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * meal.mainCoursePrice;
    });
    return (total / getTotalNbOfCoversOfTheDay(day)).toFixed(2);
}
