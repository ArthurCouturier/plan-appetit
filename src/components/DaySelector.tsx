import { DayProps } from "../api/ConfigurationInterface";

export default function DaySelector({
    days,
    selectedDay,
    setSelectedDay
}: {
    days: DayProps[],
    selectedDay: DayProps,
    setSelectedDay: (day: DayProps) => void
}) {
    return (
        <div className="flex justify-center items-center">
            <select
                className="border-2 border-borderColor bg-primary rounded-md p-2"
                value={selectedDay.name}
                onChange={(e) => {
                    const selected = days.find(day => day.name === e.target.value);
                    if (selected) setSelectedDay(selected);
                }}
            >
                {days.map(day => (
                    <option key={day.name} value={day.name}>
                        {day.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
