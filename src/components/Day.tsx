import Meal from "./Meal";
import { DayProps, MealProps } from "../api/ConfigurationInterface";
import { useState } from "react";

export default function Day({
    day,
    saveConfig
}: {
    day: DayProps;
    saveConfig: (day: DayProps) => void;
}) {
    const [editMode, setEditMode] = useState(false);

    return (
        <>
            {editMode ? (
                <EditMode
                    day={day}
                    setEditMode={setEditMode}
                    saveConfig={(mealsState: MealProps[]) =>
                        saveConfig({ name: day.name, meals: mealsState })
                    }
                />
            ) : (
                <DefaultMode
                    day={day}
                    setEditMode={setEditMode}
                />
            )}
        </>
    );
}

function DefaultMode({
    day,
    setEditMode
}: {
    day: DayProps;
    setEditMode: (value: boolean) => void;
}) {
    const { name, meals }: { name: string, meals: MealProps[] } = day;
    return (
        <button
            className="bg-secondary border border-borderColor rounded p-3 hover:scale-105 transition duration-200"
            onClick={() => setEditMode(true)}
        >
            <h3 className="text-lg font-medium text-textSecondary mb-2">
                {name}
            </h3>
            <div className="space-y-2">
                {Array.isArray(meals) ? (
                    meals.map((meal, index) => (
                        <Meal
                            key={index}
                            covers={meal.covers}
                            lunchPrice={meal.lunchPrice}
                            drinkPrice={meal.drinkPrice}
                            editMode={false}
                        />
                    ))
                ) : (
                    <p className="text-sm text-red-500">No meals available</p>
                )}
            </div>
        </button>
    );
}

function EditMode({
    day,
    setEditMode,
    saveConfig
}: {
    day: DayProps;
    setEditMode: (value: boolean) => void;
    saveConfig: (meals: MealProps[]) => void;
}) {
    const [bgColor, setBgColor] = useState("bg-borderColor");
    const [mealsState, setMealsState] = useState<MealProps[]>(day.meals);

    const handleMealChange = (index: number, updatedMeal: MealProps) => {
        const updatedMeals = [...mealsState];
        updatedMeals[index] = updatedMeal;
        setMealsState(updatedMeals);
    };

    return (
        <div className={`${bgColor} border border-borderColor rounded p-3 transition duration-200`}>
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
                    onClick={() => setEditMode(false)}
                    onMouseOver={() => setBgColor("bg-red-300")}
                    onMouseLeave={() => setBgColor("bg-borderColor")}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
