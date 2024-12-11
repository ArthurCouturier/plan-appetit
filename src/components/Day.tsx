import Meal from "./Meal";
import { DayProps } from "../api/WeekInterface";
import { useState } from "react";

export default function Day({ name, meals }: DayProps) {
    const [editMode, setEditMode] = useState(false);

    return (
        <>
            {editMode ? (
                <EditMode
                    name={name}
                    meals={meals}
                    setEditMode={setEditMode}
                />
            ) : (
                <DefaultMode
                    name={name}
                    meals={meals}
                    setEditMode={setEditMode}
                />
            )}
        </>
    );
}

function DefaultMode({ name, meals, setEditMode }: DayProps & { setEditMode: (value: boolean) => void }) {
    return (
        <button
            className="bg-gray-50 border border-gray-200 rounded p-3 hover:scale-105 transition duration-200"
            onClick={() => setEditMode(true)}
        >
            <h3 className="text-lg font-medium text-gray-600 mb-2">
                {name}
            </h3>
            <div className="space-y-2">
                {meals.map((meal, index) => (
                    <Meal
                        key={index}
                        covers={meal.covers}
                        price={meal.price}
                        editMode={false}
                    />
                ))}
            </div>
        </button>
    );
}

function EditMode({ name, meals, setEditMode }: DayProps & { setEditMode: (value: boolean) => void }) {

    const [bgColor, setBgColor] = useState("bg-gray-200");

    return (
        <div className={`${bgColor} border border-gray-200 rounded p-3 transition duration-200`}>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
                {name} (Edit Mode)
            </h3>
            <div className="space-y-2">
                {meals.map((meal, index) => (
                    <Meal
                        key={index}
                        covers={meal.covers}
                        price={meal.price}
                        editMode={true}
                    />
                ))}
            </div>
            <div className="mt-4 flex space-x-4 my-auto">
                <button
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    onClick={() => setEditMode(false)}
                    onMouseOver={() => setBgColor("bg-green-300")}
                    onMouseLeave={() => setBgColor("bg-gray-200")}
                >
                    Confirm
                </button>

                <button
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    onClick={() => setEditMode(false)}
                    onMouseOver={() => setBgColor("bg-red-300")}
                    onMouseLeave={() => setBgColor("bg-gray-200")}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
