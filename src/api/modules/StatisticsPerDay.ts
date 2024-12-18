import { DayProps } from "../ConfigurationInterface";

function getTotalNbOfCoversOfTheDay(day: DayProps): number {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers;
    });
    return total;
}

export function getTotalOfTheDay(day: DayProps): number {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * (meal.lunchPrice + meal.drinkPrice);
    });
    return total;
}

export function getTotalDrinkOfTheDay(day: DayProps): number {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * meal.drinkPrice;
    });
    return total;
}

export function getTotalLunchOfTheDay(day: DayProps): number {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * meal.lunchPrice;
    });
    return total;
}

export function getAverageBasketPerDay(day: DayProps): string {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * (meal.lunchPrice + meal.drinkPrice);
    });
    return (total / getTotalNbOfCoversOfTheDay(day)).toFixed(2);
}

export function getAverageDrinkBasketPerDay(day: DayProps): string {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * meal.drinkPrice;
    });
    return (total / getTotalNbOfCoversOfTheDay(day)).toFixed(2);
}

export function getAverageLunchBasketPerDay(day: DayProps): string {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * meal.lunchPrice;
    });
    return (total / getTotalNbOfCoversOfTheDay(day)).toFixed(2);
}
