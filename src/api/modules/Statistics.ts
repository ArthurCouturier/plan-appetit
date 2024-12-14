import { DayProps, WeekProps } from "../ConfigurationInterface";

export function getAverageBasketPerDay(day: DayProps): string {
    let total = 0;
    day.meals.forEach(meal => {
        total += meal.covers * (meal.lunchPrice + meal.drinkPrice);
    });
    return (total / day.meals.length).toFixed(2);
}

export function getAverageBasketPerWeek(week: WeekProps): string {
    let average = 0;
    let total = 0;
    let days = 0;
    week.days.forEach(day => {
        let dayTotal = 0;
        day.meals.forEach(meal => {
            dayTotal += meal.covers * (meal.lunchPrice + meal.drinkPrice);
        });
        total += dayTotal;
        days++;
    });
    average = total / days;
    return average.toFixed(2);
}

export function getAverageDrinkBasketPerWeek(week: WeekProps): string {
    let average = 0;
    let total = 0;
    let days = 0;
    week.days.forEach(day => {
        let dayTotal = 0;
        day.meals.forEach(meal => {
            dayTotal += meal.covers * meal.drinkPrice;
        });
        total += dayTotal;
        days++;
    });
    average = total / days;
    return average.toFixed(2);
}

export function getAverageLunchBasketPerWeek(week: WeekProps): string {
    let average = 0;
    let total = 0;
    let days = 0;
    week.days.forEach(day => {
        let dayTotal = 0;
        day.meals.forEach(meal => {
            dayTotal += meal.covers * meal.lunchPrice;
        });
        total += dayTotal;
        days++;
    });
    average = total / days;
    return average.toFixed(2);
}

export function getCoversPerWeek(week: WeekProps): number {
    let total = 0;
    week.days.forEach(day => {
        day.meals.forEach(meal => {
            total += meal.covers;
        });
    });
    return total;
}
