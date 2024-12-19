export default interface ConfigurationInterface {
    uuid: string;
    name: string;
    week: WeekProps;
    stats: StatsProps;
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

export interface StatsProps {
    workedWeeks: number | 0;
}
