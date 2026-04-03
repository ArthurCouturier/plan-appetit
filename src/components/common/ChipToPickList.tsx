import { useState, useEffect, useRef } from "react";
import { lightHaptic } from "../../haptics/light";
import Chip from "./Chip";

export interface ChipItem {
    name: string;
    emoji?: string;
}

interface ChipToPickListProps {
    items: ChipItem[];
    selected: string[];
    onChange: (selected: string[]) => void;
    multipleChoices?: boolean;
    other?: boolean;
    otherMaxLength?: number;
    otherPlaceholder?: string;
    onPendingOtherChange?: (value: string) => void;
}

export default function ChipToPickList({
    items,
    selected,
    onChange,
    multipleChoices = true,
    other = true,
    otherMaxLength = 25,
    otherPlaceholder = "Autre...",
    onPendingOtherChange,
}: ChipToPickListProps) {
    const [otherValue, setOtherValue] = useState("");
    const callbackRef = useRef(onPendingOtherChange);
    callbackRef.current = onPendingOtherChange;

    const knownNames = items.map((i) => i.name);
    const customValues = selected.filter((s) => !knownNames.includes(s));

    useEffect(() => {
        callbackRef.current?.(otherValue.trim());
    }, [otherValue]);

    const toggle = (name: string) => {
        if (multipleChoices) {
            if (selected.includes(name)) {
                onChange(selected.filter((s) => s !== name));
            } else {
                onChange([...selected, name]);
            }
        } else {
            onChange(selected.includes(name) ? [] : [name]);
        }
    };

    const addOther = () => {
        const trimmed = otherValue.trim();
        if (!trimmed || selected.includes(trimmed)) return;
        if (multipleChoices) {
            onChange([...selected, trimmed]);
        } else {
            onChange([trimmed]);
        }
        setOtherValue("");
        lightHaptic();
    };

    const removeCustom = (value: string) => {
        onChange(selected.filter((s) => s !== value));
        lightHaptic();
    };

    return (
        <div>
            <div className="flex flex-wrap justify-center gap-x-2 gap-y-3">
                {items.map((item) => (
                    <Chip
                        key={item.name}
                        label={item.name}
                        emoji={item.emoji}
                        active={selected.includes(item.name)}
                        onToggle={() => toggle(item.name)}
                    />
                ))}
            </div>

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

            {other && (
                <div className="flex justify-center mt-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={otherValue}
                            onChange={(e) => setOtherValue(e.target.value.slice(0, otherMaxLength))}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOther(); } }}
                            placeholder={otherPlaceholder}
                            className="bg-secondary text-text-primary placeholder-text-secondary px-4 py-2 rounded-full border border-border-color focus:outline-none focus:ring-2 focus:ring-cout-base text-sm w-40"
                        />
                        <button
                            onClick={addOther}
                            disabled={!otherValue.trim()}
                            className="px-3 py-2 bg-cout-yellow text-cout-purple font-bold rounded-full text-sm disabled:opacity-40"
                        >
                            +
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
