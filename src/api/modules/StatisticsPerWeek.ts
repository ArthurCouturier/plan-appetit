import { WeekProps } from "../ConfigurationInterface";

export function getAverageBasketPerWeek(week: WeekProps): string {
    let average = 0;
    let total = 0;
    week.days.forEach(day => {
        let dayTotal = 0;
        day.meals.forEach(meal => {
            dayTotal += meal.covers * (meal.lunchPrice + meal.drinkPrice);
        });
        total += dayTotal;
    });
    average = total / getCoversPerWeek(week);
    return average.toFixed(2);
}

export function getAverageDrinkBasketPerWeek(week: WeekProps): string {
    let average = 0;
    let total = 0;
    week.days.forEach(day => {
        let dayTotal = 0;
        day.meals.forEach(meal => {
            dayTotal += meal.covers * meal.drinkPrice;
        });
        total += dayTotal;
    });
    average = total / getCoversPerWeek(week);
    return average.toFixed(2);
}

export function getAverageLunchBasketPerWeek(week: WeekProps): string {
    let average = 0;
    let total = 0;
    week.days.forEach(day => {
        let dayTotal = 0;
        day.meals.forEach(meal => {
            dayTotal += meal.covers * meal.lunchPrice;
        });
        total += dayTotal;
    });
    average = total / getCoversPerWeek(week);
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
