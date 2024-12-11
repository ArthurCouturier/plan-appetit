export default interface WeekProps {
    name: string;
    days: DayProps[];
}

export interface DayProps {
    name: string;
    meals: MealProps[];
}

export interface MealProps {
    covers: number;
    price: number;
}
