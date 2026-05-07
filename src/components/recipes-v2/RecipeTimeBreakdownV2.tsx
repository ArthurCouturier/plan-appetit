import { ClockIcon, FireIcon, MoonIcon } from "@heroicons/react/24/outline";
import { UserGroupIcon } from "@heroicons/react/24/solid";

interface RecipeTimeBreakdownV2Props {
    prepTimeMin: number | null;
    cookTimeMin: number | null;
    restTimeMin: number | null;
    totalTimeMin: number | null;
    covers: number;
}

function formatMinutes(min: number | null): string | null {
    if (min === null || min === undefined || min <= 0) return null;
    if (min < 60) return `${min} min`;
    const hours = Math.floor(min / 60);
    const remainder = min % 60;
    if (remainder === 0) return `${hours} h`;
    return `${hours} h ${remainder.toString().padStart(2, "0")}`;
}

export default function RecipeTimeBreakdownV2({
    prepTimeMin,
    cookTimeMin,
    restTimeMin,
    totalTimeMin,
    covers,
}: RecipeTimeBreakdownV2Props) {
    const items: { label: string; value: string | null; icon: React.ReactNode }[] = [
        {
            label: "Préparation",
            value: formatMinutes(prepTimeMin),
            icon: <ClockIcon className="w-5 h-5" />,
        },
        {
            label: "Cuisson",
            value: formatMinutes(cookTimeMin),
            icon: <FireIcon className="w-5 h-5" />,
        },
        {
            label: "Repos",
            value: formatMinutes(restTimeMin),
            icon: <MoonIcon className="w-5 h-5" />,
        },
        {
            label: "Total",
            value: formatMinutes(totalTimeMin),
            icon: <ClockIcon className="w-5 h-5" />,
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {items.map((item) => {
                const isEmpty = !item.value;
                return (
                    <div
                        key={item.label}
                        className={`flex flex-col items-center justify-center rounded-lg border border-border-color bg-secondary/50 p-3 ${isEmpty ? "opacity-40" : ""}`}
                    >
                        <div className="text-cout-base mb-1">{item.icon}</div>
                        <span className="text-xs text-text-secondary uppercase tracking-wide">
                            {item.label}
                        </span>
                        <span className="text-sm font-semibold text-text-primary mt-1">
                            {item.value ?? "N/A"}
                        </span>
                    </div>
                );
            })}
            <div className="flex flex-col items-center justify-center rounded-lg border border-border-color bg-secondary/50 p-3">
                <div className="text-cout-base mb-1">
                    <UserGroupIcon className="w-5 h-5" />
                </div>
                <span className="text-xs text-text-secondary uppercase tracking-wide">
                    Couverts
                </span>
                <span className="text-sm font-semibold text-text-primary mt-1">
                    {covers > 0 ? covers : "N/A"}
                </span>
            </div>
        </div>
    );
}
