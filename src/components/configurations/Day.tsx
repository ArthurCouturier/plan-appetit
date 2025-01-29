import Meal from "./Meal";
import { useEffect, useState } from "react";
import DayStatistics from "../modules/DayStatistics";
import DayInterface from "../../api/interfaces/configurations/DayInterface";
import MealInterface from "../../api/interfaces/configurations/MealInterface";

export default function Day({
    day,
    saveConfig,
    activeEditDay,
    setActiveEditDay,
}: {
    day: DayInterface;
    saveConfig: (day: DayInterface) => void;
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
                    saveConfig={(updatedMeals: MealInterface[]) => {
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
    day: DayInterface;
    setEditMode: (value: boolean) => void;
}) {

    const { name }: { name: string } = day;

    return (
        <button
            className="flex-1 bg-secondary border-4 border-border-color rounded-md p-3 hover:scale-[0.98] transition duration-200"
            onClick={() => setEditMode(true)}
        >
            <h3 className="text-lg font-medium text-text-secondary mb-2">
                {name}
            </h3>
            <div className="space-y-2">
                <div className="my-2 rounded-sm border-2 border-border-color p-2">
                    <h3 className="text-text-secondary text-left pb-3">Service du midi ☀️</h3>
                    <Meal
                        covers={day.meals[0].covers}
                        starterPrice={day.meals[0].starterPrice}
                        mainCoursePrice={day.meals[0].mainCoursePrice}
                        dessertPrice={day.meals[0].dessertPrice}
                        drinkPrice={day.meals[0].drinkPrice}
                        editMode={false} />
                </div>
                <div className="my-2 rounded-sm border-2 border-border-color p-2">
                    <h3 className="text-text-secondary text-left pb-3">Service du soir 🌙</h3>
                    <Meal
                        covers={day.meals[1].covers}
                        starterPrice={day.meals[1].starterPrice}
                        mainCoursePrice={day.meals[1].mainCoursePrice}
                        dessertPrice={day.meals[1].dessertPrice}
                        drinkPrice={day.meals[1].drinkPrice}
                        editMode={false} />
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
    day: DayInterface;
    mealsState: MealInterface[];
    setMealsState: (value: MealInterface[]) => void;
    setEditMode: (value: boolean) => void;
    saveConfig: (meals: MealInterface[]) => void;
}) {
    const [bgColor, setBgColor] = useState("bg-secondary");

    const handleMealChange = (index: number, updatedMeal: MealInterface) => {
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
            className={`${bgColor} border-4 border-border-color rounded-lg p-5 shadow-md transition duration-300 flex-1`}
        >
            <h3 className="text-xl font-semibold text-text-primary mb-4 text-center">
                {day.name} (Modif)
            </h3>

            <div className="space-y-4">
                <div className="bg-bg-color rounded-lg p-4 shadow-sm hover:shadow-lg transition duration-200">
                    <h3 className="text-text-secondary text-left pb-3">Service du midi ☀️</h3>
                    <Meal
                        covers={mealsState[0].covers}
                        starterPrice={mealsState[0].starterPrice}
                        mainCoursePrice={mealsState[0].mainCoursePrice}
                        dessertPrice={mealsState[0].dessertPrice}
                        drinkPrice={mealsState[0].drinkPrice}
                        editMode={true}
                        onChange={(updatedMeal: MealInterface) => handleMealChange(0, updatedMeal)} />
                </div>
                <div className="bg-bg-color rounded-lg p-4 shadow-sm hover:shadow-lg transition duration-200">
                    <h3 className="text-text-secondary text-left pb-3">Service du soir 🌙</h3>
                    <Meal
                        covers={mealsState[1].covers}
                        starterPrice={mealsState[1].starterPrice}
                        mainCoursePrice={mealsState[1].mainCoursePrice}
                        dessertPrice={mealsState[1].dessertPrice}
                        drinkPrice={mealsState[1].drinkPrice}
                        editMode={true}
                        onChange={(updatedMeal: MealInterface) => handleMealChange(1, updatedMeal)} />
                </div>
            </div>

            <div className="mt-6 flex justify-center gap-6">
                <button
                    className="bg-confirmation-1 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:bg-indigo-600 hover:shadow-lg focus:ring-3 focus:ring-indigo-300 transition duration-300"
                    onClick={() => {
                        saveConfig(mealsState);
                        setEditMode(false);
                    }}
                    onMouseEnter={() => setBgColor("bg-confirmation-2")}
                    onMouseLeave={() => setBgColor("bg-secondary")}
                >
                    Sauvegarder
                </button>

                <button
                    className="bg-cancel-1 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:bg-red-600 hover:shadow-lg focus:ring-3 focus:ring-gray-200 transition duration-300"
                    onClick={() => {
                        setMealsState(day.meals);
                        setEditMode(false);
                    }}
                    onMouseEnter={() => setBgColor("bg-cancel-2")}
                    onMouseLeave={() => setBgColor("bg-secondary")}
                >
                    Annuler
                </button>
            </div>
        </div>
    );
}
