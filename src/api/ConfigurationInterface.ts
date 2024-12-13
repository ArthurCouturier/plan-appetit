export default interface ConfigurationInterface {
    name: string;
    week: WeekProps;
}

export interface WeekProps {
    name: string;
    days: DayProps[];
}

export interface DayProps {
    name: string;
    meals: MealProps[];
}

export interface MealProps {
    covers: number;
    lunchPrice: number;
    drinkPrice: number;
}
