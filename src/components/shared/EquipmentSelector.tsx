import { useEffect, useState } from "react";
import { lightHaptic } from "../../haptics/light";
import EquipmentCard from "../batchcooking/EquipmentCard";
import equipmentsData from "../../data/equipments.json";

interface EquipmentSelectorProps {
    selected: string[];
    onChange: (selected: string[]) => void;
    title?: string;
    allowCustom?: boolean;
    customMaxLength?: number;
    customPlaceholder?: string;
}

function useColumnsCount(): number {
    const [cols, setCols] = useState(3);

    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            if (w >= 1024) setCols(5);
            else if (w >= 768) setCols(4);
            else setCols(3);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    return cols;
}

function toggleInList(list: string[], item: string): string[] {
    return list.includes(item) ? list.filter((s) => s !== item) : [...list, item];
}

export default function EquipmentSelector({
    selected,
    onChange,
    title = "Équipement disponible",
    allowCustom = false,
    customMaxLength = 30,
    customPlaceholder = "Autre équipement...",
}: EquipmentSelectorProps) {
    const [showAll, setShowAll] = useState(false);
    const [customInput, setCustomInput] = useState("");
    const cols = useColumnsCount();
    const collapsedCount = cols * 3;
    const needsToggle = equipmentsData.length > collapsedCount;
    const visibleEquipments = showAll ? equipmentsData : equipmentsData.slice(0, collapsedCount);

    const knownNames = equipmentsData.map((e) => e.name);
    const customValues = selected.filter((s) => !knownNames.includes(s));

    const addCustom = () => {
        const trimmed = customInput.trim();
        if (!trimmed || selected.includes(trimmed)) return;
        onChange([...selected, trimmed]);
        setCustomInput("");
        lightHaptic();
    };

    const removeCustom = (value: string) => {
        onChange(selected.filter((s) => s !== value));
        lightHaptic();
    };

    return (
        <div>
            {title && (
                <h3 className="text-sm font-semibold text-text-secondary mb-3">
                    {title}
                </h3>
            )}
            <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
                {visibleEquipments.map((eq) => (
                    <EquipmentCard
                        key={eq.name}
                        name={eq.name}
                        icon={eq.icon}
                        selected={selected.includes(eq.name)}
                        onToggle={() => onChange(toggleInList(selected, eq.name))}
                    />
                ))}
            </div>
            <div className="my-4">
                {needsToggle && (
                    <button
                        onClick={() => { setShowAll(!showAll); lightHaptic(); }}
                        className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 bg-secondary opacity-50 text-text-primary border border-border-color mx-auto"
                    >
                        <span className="text-lg">{showAll ? "▲" : "▼"}</span>
                        <span className="text-xs font-semibold">{showAll ? "Voir moins" : "Voir plus"}</span>
                    </button>
                )}
            </div>

            {allowCustom && (
                <>
                    {customValues.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-2 mt-3">
                            {customValues.map((value) => (
                                <span
                                    key={value}
                                    className="px-3 py-1.5 bg-cout-yellow/20 text-cout-purple rounded-full text-sm flex items-center gap-1.5 font-medium"
                                >
                                    {value}
                                    <button
                                        onClick={() => removeCustom(value)}
                                        className="font-bold text-cout-purple/60 hover:text-cout-purple"
                                    >
                                        x
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-center mt-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value.slice(0, customMaxLength))}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
                                placeholder={customPlaceholder}
                                className="bg-secondary text-text-primary placeholder-text-secondary px-4 py-2 rounded-full border border-border-color focus:outline-none focus:ring-2 focus:ring-cout-base text-sm w-44"
                            />
                            <button
                                onClick={addCustom}
                                disabled={!customInput.trim()}
                                className="px-3 py-2 bg-cout-yellow text-cout-purple font-bold rounded-full text-sm disabled:opacity-40"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
