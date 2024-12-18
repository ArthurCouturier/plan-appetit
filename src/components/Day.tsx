import Meal from "./Meal";
import { DayProps, MealProps } from "../api/ConfigurationInterface";
import { useEffect, useState } from "react";
import DayStatistics from "./modules/DayStatistics";

export default function Day({
    day,
    saveConfig,
}: {
    day: DayProps;
    saveConfig: (day: DayProps) => void;
}) {
    const [editMode, setEditMode] = useState(false);
    const [dynamicDay, setDynamicDay] = useState(day);
    const [mealsState, setMealsState] = useState(day.meals);

    useEffect(() => {
        setDynamicDay(day);
        setMealsState(day.meals);
    }, [day]);

    return (
        <div className="h-full flex">
            {editMode ? (
                <EditMode
                    day={dynamicDay}
                    mealsState={mealsState}
                    setMealsState={setMealsState}
                    setEditMode={setEditMode}
                    saveConfig={(updatedMeals: MealProps[]) => {
                        saveConfig({ name: day.name, meals: updatedMeals });
                        setMealsState(updatedMeals);
                    }}
                />
            ) : (
                <DefaultMode
                    day={dynamicDay}
                    setEditMode={setEditMode}
                />
            )}

            <DayStatistics day={{ ...dynamicDay, meals: mealsState }} />
        </div>
    );
}

function DefaultMode({
    day,
    setEditMode
}: {
    day: DayProps;
    setEditMode: (value: boolean) => void;
}) {

    const { name }: { name: string } = day;

    return (
        <button
            className="flex-1 bg-secondary border-4 border-borderColor rounded-md p-3 hover:scale-[0.98] transition duration-200"
            onClick={() => setEditMode(true)}
        >
            <h3 className="text-lg font-medium text-textSecondary mb-2">
                {name}
            </h3>
            <div className="space-y-2">
                <div className="my-2 rounded border-2 border-borderColor p-2">
                    <h3 className="text-textSecondary text-left">Midi ☀️</h3>
                    <Meal
                        covers={day.meals[0].covers}
                        lunchPrice={day.meals[0].lunchPrice}
                        drinkPrice={day.meals[0].drinkPrice}
                        editMode={false}
                    />
                </div>
                <div className="my-2 rounded border-2 border-borderColor p-2">
                    <h3 className="text-textSecondary text-left">Soir 🌙</h3>
                    <Meal
                        covers={day.meals[1].covers}
                        lunchPrice={day.meals[1].lunchPrice}
                        drinkPrice={day.meals[1].drinkPrice}
                        editMode={false}
                    />
                </div>
            </div>
        </button>
    );
}

function EditMode({
    day,
    mealsState,
    setMealsState,
    setEditMode,
    saveConfig,
}: {
    day: DayProps;
    mealsState: MealProps[];
    setMealsState: (value: MealProps[]) => void;
    setEditMode: (value: boolean) => void;
    saveConfig: (meals: MealProps[]) => void;
}) {
    const [bgColor, setBgColor] = useState("bg-borderColor");

    const handleMealChange = (index: number, updatedMeal: MealProps) => {
        const updatedMeals = [...mealsState];
        updatedMeals[index] = updatedMeal;
        setMealsState(updatedMeals);
    };

    window.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            saveConfig(mealsState);
            setEditMode(false);
        }
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            setMealsState(day.meals);
            setEditMode(false);
        }
    });

    return (
        <div className={`${bgColor} border border-borderColor rounded-md p-3 transition duration-200 flex-1`}>
            <h3 className="text-lg font-medium text-textSecondary mb-2">
                {day.name} (Modif)
            </h3>
            <div className="space-y-2">
                {mealsState.map((meal, index) => (
                    <Meal
                        key={index}
                        covers={meal.covers}
                        lunchPrice={meal.lunchPrice}
                        drinkPrice={meal.drinkPrice}
                        editMode={true}
                        onChange={(updatedMeal: MealProps) =>
                            handleMealChange(index, updatedMeal)
                        }
                    />
                ))}
            </div>
            <div className="mt-4 flex space-x-4 my-auto">
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => {
                        saveConfig(mealsState);
                        setEditMode(false);
                    }}
                    onMouseOver={() => setBgColor("bg-green-300")}
                    onMouseLeave={() => setBgColor("bg-borderColor")}
                >
                    Confirm
                </button>

                <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={() => {
                        setMealsState(day.meals);
                        setEditMode(false);
                    }}
                    onMouseOver={() => setBgColor("bg-red-300")}
                    onMouseLeave={() => setBgColor("bg-borderColor")}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
