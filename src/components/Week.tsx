import WeekProps from "../api/WeekInterface";
import Day from "./Day";

export default function Week({ name, days }: WeekProps) {
    return (
        <div key={name} className="bg-white shadow rounded-lg p-4 w-[900vw]">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
                {name === "weekA" ? "Week A" : "Week B"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {days.map((day) => (
                    <Day name={day.name} meals={day.meals} />
                ))}
            </div>
        </div>
    )
}