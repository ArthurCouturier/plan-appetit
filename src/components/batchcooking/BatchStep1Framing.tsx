import { useState } from "react";
import { motion } from "framer-motion";
import { lightHaptic } from "../../haptics/light";
import type { BatchCookingSlot, MealType } from "../../api/interfaces/batchcooking/BatchCookingInterfaces";
import NumberFlow from "@number-flow/react";

interface BatchStep1FramingProps {
    name: string;
    totalMeals: number;
    peopleCount: number;
    isDetailed: boolean;
    slots: BatchCookingSlot[];
    onNameChange: (name: string) => void;
    onTotalMealsChange: (n: number) => void;
    onPeopleCountChange: (n: number) => void;
    onDetailedChange: (detailed: boolean) => void;
    onSlotsChange: (slots: BatchCookingSlot[]) => void;
    onNext: () => void;
}

const MEAL_TYPE_LABELS: Record<MealType, string> = {
    LUNCH: "Dejeuner",
    DINNER: "Diner",
    UNSPECIFIED: "Non precise",
};

export default function BatchStep1Framing({
    name,
    totalMeals,
    peopleCount,
    isDetailed,
    slots,
    onNameChange,
    onTotalMealsChange,
    onPeopleCountChange,
    onDetailedChange,
    onSlotsChange,
    onNext,
}: BatchStep1FramingProps) {
    const [showSlots, setShowSlots] = useState(isDetailed);

    const handleTotalMealsChange = (n: number) => {
        lightHaptic();
        onTotalMealsChange(n);
        if (showSlots) {
            const newSlots: BatchCookingSlot[] = Array.from({ length: n }, (_, i) => {
                const existing = slots[i];
                return existing || { index: i, peopleCount: peopleCount, type: "UNSPECIFIED" as MealType };
            });
            onSlotsChange(newSlots);
        }
    };

    const handleToggleDetailed = () => {
        lightHaptic();
        const newDetailed = !showSlots;
        setShowSlots(newDetailed);
        onDetailedChange(newDetailed);
        if (newDetailed) {
            const newSlots: BatchCookingSlot[] = Array.from({ length: totalMeals }, (_, i) => {
                const existing = slots[i];
                return existing || { index: i, peopleCount: peopleCount, type: "UNSPECIFIED" as MealType };
            });
            onSlotsChange(newSlots);
        }
    };

    const updateSlot = (index: number, field: "peopleCount" | "type", value: number | MealType) => {
        const newSlots = slots.map((s, i) =>
            i === index ? { ...s, [field]: value } : s
        );
        onSlotsChange(newSlots);
    };

    const canProceed = name.trim().length > 0 && totalMeals >= 2;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center px-4"
        >
            <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
                Batch cooking
            </h2>

            <div className="w-full max-w-md flex flex-col">
                {/* Nom */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-text-secondary mb-2">
                        Nom du batch cooking
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => onNameChange(e.target.value.slice(0, 50))}
                        maxLength={50}
                        placeholder="Ex: Batch cooking du dimanche"
                        className="w-full bg-secondary text-text-primary placeholder-text-secondary px-5 py-4 rounded-xl border border-border-color focus:outline-none focus:ring-2 focus:ring-cout-base text-lg"
                    />
                </div>

                {/* Nombre de repas */}
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-text-primary text-center mb-4">
                        Combien de repas ?
                    </h3>
                    <div className="flex justify-center">
                        <input
                            type="range"
                            min={2}
                            max={8}
                            value={totalMeals}
                            onChange={(e) => handleTotalMealsChange(Number(e.target.value))}
                            className="w-full max-w-xs accent-cout-yellow"
                        />
                    </div>
                    <p className="text-center text-2xl font-bold text-cout-purple mt-2">
                        <NumberFlow value={totalMeals} /> repas
                    </p>
                </div>

                {/* Nombre de personnes (mode SIMPLE) - animated */}
                <div
                    className="grid transition-[grid-template-rows,margin-bottom] duration-[400ms] ease-in-out"
                    style={{ gridTemplateRows: !showSlots ? "1fr" : "0fr", marginBottom: !showSlots ? "2rem" : 0 }}
                >
                    <div className="overflow-hidden">
                        <div className="pb-2">
                            <h3 className="text-lg font-bold text-text-primary text-center mb-4">
                                Pour combien de personnes ?
                            </h3>
                            <div className="flex justify-center gap-3 pb-2">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <button
                                        key={n}
                                        onClick={() => { onPeopleCountChange(n); lightHaptic(); }}
                                        className={`w-11 h-11 rounded-full text-lg font-bold transition-all duration-200 ${peopleCount === n
                                            ? "bg-cout-yellow text-cout-purple scale-105 shadow-md"
                                            : "bg-secondary text-text-primary border border-border-color hover:border-cout-base"
                                            }`}
                                    >
                                        {n === 6 ? "6+" : n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Toggle personnaliser */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <span className="text-sm text-text-secondary">Personnaliser par repas</span>
                    <button
                        onClick={handleToggleDetailed}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${showSlots ? "bg-cout-purple" : "bg-cout-yellow"
                            }`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${showSlots ? "translate-x-6" : "translate-x-0"
                                }`}
                        />
                    </button>
                </div>

                {/* Slots inline (mode DETAILED) - animated */}
                <div
                    className="grid transition-[grid-template-rows] duration-[400ms] ease-in-out"
                    style={{ gridTemplateRows: showSlots ? "1fr" : "0fr" }}
                >
                    <div className="overflow-hidden">
                        <div className="pt-2 space-y-3 bg-secondary rounded-xl p-4">
                            {slots.map((slot, i) => (
                                <div key={i} className="flex items-center gap-3 bg-primary rounded-lg p-3">
                                    <span className="text-sm font-bold text-text-secondary w-16 shrink-0">
                                        Repas {i + 1}
                                    </span>
                                    <select
                                        value={slot.type}
                                        onChange={(e) => updateSlot(i, "type", e.target.value as MealType)}
                                        className="flex-1 bg-secondary text-text-primary rounded-lg px-3 py-2 text-sm border border-border-color"
                                    >
                                        {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((t) => (
                                            <option key={t} value={t}>{MEAL_TYPE_LABELS[t]}</option>
                                        ))}
                                    </select>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updateSlot(i, "peopleCount", Math.max(1, slot.peopleCount - 1))}
                                            className="w-8 h-8 rounded-full bg-secondary border border-border-color text-text-primary font-bold"
                                        >
                                            -
                                        </button>
                                        <span className="w-6 text-center text-sm font-bold text-text-primary">
                                            {slot.peopleCount}
                                        </span>
                                        <button
                                            onClick={() => updateSlot(i, "peopleCount", Math.min(10, slot.peopleCount + 1))}
                                            className="w-8 h-8 rounded-full bg-secondary border border-border-color text-text-primary font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onNext}
                disabled={!canProceed}
                className="mt-10 px-10 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg hover:brightness-110 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-40 disabled:transform-none disabled:cursor-not-allowed"
            >
                Suivant
            </button>
        </motion.div>
    );
}
