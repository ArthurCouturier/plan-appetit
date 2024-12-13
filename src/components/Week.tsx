import ConfigurationInterface, { DayProps } from "../api/ConfigurationInterface";
import Day from "./Day";

export default function Week({
    config,
    saveConfig,
}: {
    config: ConfigurationInterface;
    saveConfig: (config: ConfigurationInterface) => void;
}) {
    return (
        <div key={config.week.name} className="bg-white shadow rounded-lg p-4 w-full">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
                {config.week.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {config.week.days.map((day: DayProps, index: number) => (
                    <Day key={index} day={day} saveConfig={
                        (day: DayProps) => {
                            config.week.days[index] = day;
                            saveConfig(config);
                        }
                    } />
                ))}
            </div>
        </div>
    );
}
