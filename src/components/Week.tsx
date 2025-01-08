import { useState } from "react";
import ConfigurationInterface from "../api/interfaces/ConfigurationInterface";
import Day from "./Day";
import DayInterface from "../api/interfaces/DayInterface";

export default function Week({
    config,
    saveConfig,
}: {
    config: ConfigurationInterface;
    saveConfig: (config: ConfigurationInterface) => void;
}) {

    const [open, setOpen] = useState(true);

    const handleOpen = () => {
        setOpen(!open);
    }

    const [activeEditDay, setActiveEditDay] = useState<string | null>(null);

    return (
        <div key={config.week.name} className="bg-primary shadow rounded-lg p-4 w-full">
            <h2
                className="text-xl font-semibold text-textSecondary mb-3 flex items-center justify-center"
                onClick={handleOpen}
            >
                {config.name}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    width="24"
                    height="24"
                    className={`${open ? 'transform rotate-90 pb-2' : ''} transition duration-200`}
                >
                    <line x1="14" y1="6" x2="20" y2="12" />
                    <line x1="14" y1="18" x2="20" y2="12" />
                </svg>
            </h2>
            {open && (
                <div className="flex flex-col gap-4">
                    {config.week.days.map((day: DayInterface, index: number) => (
                        <div className="h-full">
                            <Day
                                key={index}
                                day={day}
                                saveConfig={(day: DayInterface) => {
                                    config.week.days[index] = day;
                                    saveConfig(config);
                                }}
                                activeEditDay={activeEditDay}
                                setActiveEditDay={setActiveEditDay}
                            />
                        </div>
                    ))}
                </div>
            )}

        </div>
    );
}
