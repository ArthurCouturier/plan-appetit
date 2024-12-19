import Meal from "./Meal";
import { DayProps, MealProps } from "../api/ConfigurationInterface";
import { useEffect, useState } from "react";
import DayStatistics from "./modules/DayStatistics";

export default function Day({
    day,
    saveConfig,
    activeEditDay,
    setActiveEditDay,
}: {
    day: DayProps;
    saveConfig: (day: DayProps) => void;
    activeEditDay: string | null;
    setActiveEditDay: (value: string | null) => void;
}) {
    const [editMode, setEditMode] = useState(false);
    const [dynamicDay, setDynamicDay] = useState(day);
    const [mealsState, setMealsState] = useState(day.meals);

    useEffect(() => {
        setDynamicDay(day);
        setMealsState(day.meals);
    }, [day]);

    // Close edit mode if another day is selected
    useEffect(() => {
        if (activeEditDay && activeEditDay !== day.name && editMode) {
            setEditMode(false);
            setMealsState(day.meals);
        }
    }, [activeEditDay, day.name, editMode, day.meals]);

    return (
        <div className="h-full flex">
            {editMode ? (
                <EditMode
                    day={dynamicDay}
                    mealsState={mealsState}
                    setMealsState={setMealsState}
                    setEditMode={(value) => {
                        setEditMode(value);
                        if (value) {
                            setActiveEditDay(day.name);
                        } else {
                            setActiveEditDay(null);
                        }
                    }}
                    saveConfig={(updatedMeals: MealProps[]) => {
                        saveConfig({ name: day.name, meals: updatedMeals });
                        setMealsState(updatedMeals);
                        setActiveEditDay(null);
                    }}
                />
            ) : (
                <DefaultMode
                    day={dynamicDay}
                    setEditMode={(value) => {
                        setEditMode(value);
                        if (value) {
                            setActiveEditDay(day.name);
                        }
                    }}
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
                    <h3 className="text-textSecondary text-left pb-3">Service du midi ☀️</h3>
                    <Meal
                        covers={day.meals[0].covers}
                        lunchPrice={day.meals[0].lunchPrice}
                        drinkPrice={day.meals[0].drinkPrice}
                        editMode={false}
                    />
                </div>
                <div className="my-2 rounded border-2 border-borderColor p-2">
                    <h3 className="text-textSecondary text-left pb-3">Service du soir 🌙</h3>
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
    const [bgColor, setBgColor] = useState("bg-secondary");

    const handleMealChange = (index: number, updatedMeal: MealProps) => {
        const updatedMeals = [...mealsState];
        updatedMeals[index] = updatedMeal;
        setMealsState(updatedMeals);
    };

    useEffect(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                saveConfig(mealsState);
                setEditMode(false);
            } else if (e.key === "Escape") {
                setMealsState(day.meals);
                setEditMode(false);
            }
        };

        window.addEventListener("keydown", handleKeydown);

        return () => {
            window.removeEventListener("keydown", handleKeydown);
        };
    }, [mealsState, setEditMode, saveConfig, day.meals, setMealsState]);

    return (
        <div
            className={`${bgColor} border-4 border-borderColor rounded-lg p-5 shadow-md transition duration-300 flex-1`}
        >
            <h3 className="text-xl font-semibold text-textPrimary mb-4 text-center">
                {day.name} (Modif)
            </h3>

            <div className="space-y-4">
                <div className="bg-bgColor rounded-lg p-4 shadow hover:shadow-lg transition duration-200">
                    <h3 className="text-textSecondary text-left pb-3">Service du midi ☀️</h3>
                    <Meal
                        covers={mealsState[0].covers}
                        lunchPrice={mealsState[0].lunchPrice}
                        drinkPrice={mealsState[0].drinkPrice}
                        editMode={true}
                        onChange={(updatedMeal: MealProps) =>
                            handleMealChange(0, updatedMeal)
                        }
                    />
                </div>
                <div className="bg-bgColor rounded-lg p-4 shadow hover:shadow-lg transition duration-200">
                    <h3 className="text-textSecondary text-left pb-3">Service du soir 🌙</h3>
                    <Meal
                        covers={mealsState[1].covers}
                        lunchPrice={mealsState[1].lunchPrice}
                        drinkPrice={mealsState[1].drinkPrice}
                        editMode={true}
                        onChange={(updatedMeal: MealProps) =>
                            handleMealChange(1, updatedMeal)
                        }
                    />
                </div>
            </div>

            <div className="mt-6 flex justify-center gap-6">
                <button
                    className="bg-confirmation1 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:bg-indigo-600 hover:shadow-lg focus:ring focus:ring-indigo-300 transition duration-300"
                    onClick={() => {
                        saveConfig(mealsState);
                        setEditMode(false);
                    }}
                    onMouseEnter={() => setBgColor("bg-confirmation2")}
                    onMouseLeave={() => setBgColor("bg-secondary")}
                >
                    Sauvegarder
                </button>

                <button
                    className="bg-cancel1 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg focus:ring focus:ring-gray-200 transition duration-300"
                    onClick={() => {
                        setMealsState(day.meals);
                        setEditMode(false);
                    }}
                    onMouseEnter={() => setBgColor("bg-cancel2")}
                    onMouseLeave={() => setBgColor("bg-secondary")}
                >
                    Annuler
                </button>
            </div>
        </div>
    );
}
