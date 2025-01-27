import WeekInterface from "../interfaces/configurations/WeekInterface";

export function getAverageBasketPerWeek(week: WeekInterface): string {
    let average = 0;
    let total = 0;
    week.days.forEach(day => {
        let dayTotal = 0;
        day.meals.forEach(meal => {
            dayTotal += meal.covers * (meal.starterPrice + meal.mainCoursePrice + meal.dessertPrice + meal.drinkPrice);
        });
        total += dayTotal;
    });
    average = total / getCoversPerWeek(week);
    return average.toFixed(2);
}

export function getAverageDrinkBasketPerWeek(week: WeekInterface): string {
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

export function getAverageLunchBasketPerWeek(week: WeekInterface): string {
    let average = 0;
    let total = 0;
    week.days.forEach(day => {
        let dayTotal = 0;
        day.meals.forEach(meal => {
            dayTotal += meal.covers * (meal.starterPrice + meal.mainCoursePrice + meal.dessertPrice);
        });
        total += dayTotal;
    });
    average = total / getCoversPerWeek(week);
    return average.toFixed(2);
}

export function getCoversPerWeek(week: WeekInterface): number {
    let total = 0;
    week.days.forEach(day => {
        day.meals.forEach(meal => {
            total += meal.covers;
        });
    });
    return total;
}

export function workedDaysPerWeek(week: WeekInterface): number {
    let total = 0;
    week.days.forEach(day => {
        if (day.meals[0].covers > 0 || day.meals[1].covers > 0) {
            total++;
        }
    });
    return total;
}

export function workedMealsPerWeek(week: WeekInterface): number {
    let total = 0;
    week.days.forEach(day => {
        day.meals.forEach(meal => {
            if (meal.covers > 0) {
                total++;
            }
        });
    });
    return total;
}

export function mealsCookedPerWeek(week: WeekInterface): number {
    let total = 0;
    week.days.forEach(day => {
        day.meals.forEach(meal => {
            total += meal.covers;
        });
    });
    return total;
}

export function totalWeeklySales(week: WeekInterface): number {
    let total = 0;
    week.days.forEach(day => {
        day.meals.forEach(meal => {
            total += meal.covers * (meal.starterPrice + meal.mainCoursePrice + meal.dessertPrice + meal.drinkPrice);
        });
    });
    return total;
}
