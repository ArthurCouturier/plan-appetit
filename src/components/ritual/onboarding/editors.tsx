import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ChipToPickList from "../../common/ChipToPickList";
import EquipmentSelector from "../../shared/EquipmentSelector";
import SteppedSlider from "../../fields/SteppedSlider";
import dietaryRestrictionsAndAllergies from "../../../data/dietaryRestrictionsAndAllergies.json";
import flavorPreferences from "../../../data/flavorPreferences.json";
import type {
    CookingLevel,
} from "../../../api/interfaces/users/UserCulinaryProfileInterface";
import type { BudgetTarget } from "../../../api/interfaces/batchcooking/BatchCookingInterfaces";
import { lightHaptic } from "../../../haptics/light";
import {
    DAYS,
    DAY_LABEL,
    DEFAULT_AMBITIOUS_DAYS,
    MEAL_CODES,
    MEAL_LABEL,
    NONE_RESTRICTION,
    TIME_STEPS,
} from "./constants";
import { arraysEqual, sortDays } from "./labels";

export function QuestionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
            {children}
        </h2>
    );
}

export function Q1Household({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const options = [1, 2, 3, 4, 5, 6];
    return (
        <>
            <QuestionTitle>Combien de personnes à table en général ?</QuestionTitle>
            <div className="flex justify-center gap-2">
                {options.map((n) => (
                    <button
                        key={n}
                        onClick={() => { onChange(n); lightHaptic(); }}
                        className={`w-12 h-12 rounded-full font-bold text-lg transition-all ${
                            value === n
                                ? "bg-cout-yellow text-cout-purple scale-110 shadow-md"
                                : "bg-secondary border border-border-color text-text-primary"
                        }`}
                    >
                        {n === 6 ? "6+" : n}
                    </button>
                ))}
            </div>
        </>
    );
}

export function Q2Restrictions({
    selected,
    onChange,
    customValue,
    onCustomChange,
}: {
    selected: string[];
    onChange: (s: string[]) => void;
    customValue: string;
    onCustomChange: (v: string) => void;
}) {
    const hasNone = selected.includes(NONE_RESTRICTION);
    const realRestrictions = selected.filter((s) => s !== NONE_RESTRICTION);

    const toggleNone = () => {
        if (hasNone) {
            onChange(realRestrictions);
        } else {
            onChange([NONE_RESTRICTION]);
        }
        lightHaptic();
    };

    return (
        <>
            <QuestionTitle>As-tu des restrictions alimentaires ou allergies ?</QuestionTitle>
            <p className="text-text-secondary text-sm text-center mb-6">
                Sélectionne « Aucune restriction » si tu n'en as pas. Cette question est obligatoire pour ta sécurité.
            </p>
            <button
                type="button"
                onClick={toggleNone}
                className={`w-full mb-6 px-5 py-4 rounded-2xl font-semibold transition-all ${
                    hasNone
                        ? "bg-cout-yellow/20 border-2 border-cout-yellow text-text-primary"
                        : "bg-secondary border border-border-color text-text-primary"
                }`}
            >
                Aucune restriction
            </button>
            <ChipToPickList
                items={dietaryRestrictionsAndAllergies}
                selected={realRestrictions}
                onChange={(next) => onChange(next.filter((s) => s !== NONE_RESTRICTION))}
                onPendingOtherChange={onCustomChange}
                otherPlaceholder="Autre restriction..."
            />
            {customValue.trim() && !hasNone && (
                <p className="text-xs text-text-secondary text-center mt-3">
                    Pense à ajouter « {customValue.trim()} » avant de passer à la suite (touche +).
                </p>
            )}
        </>
    );
}

export function Q3Budget({ value, onChange }: { value: BudgetTarget; onChange: (v: BudgetTarget) => void }) {
    const options: { value: BudgetTarget; label: string; sub: string }[] = [
        { value: "ECONOMICAL", label: "Éco", sub: "< 3 €" },
        { value: "BALANCED", label: "Équilibré", sub: "3 - 6 €" },
        { value: "COMFORT", label: "Confort", sub: "6 € +" },
    ];
    return (
        <>
            <QuestionTitle>Quel budget tu te donnes par personne et par repas ?</QuestionTitle>
            <div className="flex flex-col gap-3">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => { onChange(opt.value); lightHaptic(); }}
                        className={`flex justify-between items-center px-5 py-4 rounded-2xl transition-all text-left ${
                            value === opt.value
                                ? "bg-cout-yellow/20 border-2 border-cout-yellow"
                                : "bg-secondary border border-border-color"
                        }`}
                    >
                        <span className="font-bold text-text-primary">{opt.label}</span>
                        <span className="text-text-secondary text-sm">{opt.sub}</span>
                    </button>
                ))}
            </div>
        </>
    );
}

export function Q4CookingLevel({
    value,
    onChange,
}: {
    value: CookingLevel;
    onChange: (v: CookingLevel) => void;
}) {
    const options: { value: CookingLevel; label: string }[] = [
        { value: "BEGINNER", label: "Je débute" },
        { value: "INTERMEDIATE", label: "Je sais faire pas mal de trucs" },
        { value: "ADVANCED", label: "Je maîtrise" },
    ];
    return (
        <>
            <QuestionTitle>Tu te débrouilles comment en cuisine ?</QuestionTitle>
            <div className="flex flex-col gap-3">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => { onChange(opt.value); lightHaptic(); }}
                        className={`px-5 py-4 rounded-2xl transition-all text-left font-semibold text-text-primary ${
                            value === opt.value
                                ? "bg-cout-yellow/20 border-2 border-cout-yellow"
                                : "bg-secondary border border-border-color"
                        }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </>
    );
}

export function Q5TimeLunch({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <>
            <QuestionTitle>Le midi en semaine, combien de temps tu as pour cuisiner ?</QuestionTitle>
            <SteppedSlider value={value} onChange={onChange} steps={TIME_STEPS} suffix=" min" />
        </>
    );
}

export function Q6TimeDinner({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <>
            <QuestionTitle>Et le soir en semaine ?</QuestionTitle>
            <SteppedSlider value={value} onChange={onChange} steps={TIME_STEPS} suffix=" min" />
        </>
    );
}

export function Q7AmbitiousMeals({
    value,
    onChange,
}: {
    value: string[];
    onChange: (v: string[]) => void;
}) {
    const daysFromValue = useMemo(
        () => Array.from(new Set(value.map((code) => code.split("_")[0]))),
        [value],
    );
    const [displayedDays, setDisplayedDays] = useState<string[]>(() =>
        daysFromValue.length > 0 ? sortDays(daysFromValue) : DEFAULT_AMBITIOUS_DAYS,
    );
    const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null);

    useEffect(() => {
        const fromValue = sortDays(Array.from(new Set(value.map((c) => c.split("_")[0]))));
        if (fromValue.length === 0) return;
        if (!arraysEqual(fromValue, displayedDays.filter((d) => fromValue.includes(d)))) {
            setDisplayedDays((prev) => sortDays(Array.from(new Set([...prev, ...fromValue]))));
        }
    }, [value]);

    const toggleMeal = (day: string, meal: string) => {
        const code = `${day}_${meal}`;
        if (value.includes(code)) {
            onChange(value.filter((c) => c !== code));
        } else {
            onChange([...value, code]);
        }
        lightHaptic();
    };

    const removeDay = (day: string) => {
        setDisplayedDays((prev) => prev.filter((d) => d !== day));
        onChange(value.filter((c) => !c.startsWith(`${day}_`)));
        lightHaptic();
    };

    const changeDay = (oldDay: string, newDay: string) => {
        setDisplayedDays((prev) => sortDays(prev.map((d) => (d === oldDay ? newDay : d))));
        onChange(value.map((c) => (c.startsWith(`${oldDay}_`) ? c.replace(oldDay, newDay) : c)));
        setPickerOpenFor(null);
        lightHaptic();
    };

    const addDay = () => {
        const available = DAYS.find((d) => !displayedDays.includes(d.code));
        if (!available) return;
        setDisplayedDays((prev) => sortDays([...prev, available.code]));
        lightHaptic();
    };

    const canAddMore = displayedDays.length < DAYS.length;

    return (
        <>
            <QuestionTitle>Quels repas tu aimes prendre le temps de cuisiner ?</QuestionTitle>
            <p className="text-text-secondary text-sm text-center mb-6">
                Configure les jours et coche les créneaux ambitieux.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayedDays.map((day) => (
                    <DayCard
                        key={day}
                        day={day}
                        selectedMeals={value.filter((c) => c.startsWith(`${day}_`)).map((c) => c.split("_")[1])}
                        onToggleMeal={(meal) => toggleMeal(day, meal)}
                        onRemove={() => removeDay(day)}
                        pickerOpen={pickerOpenFor === day}
                        onOpenPicker={() => setPickerOpenFor(day)}
                        onClosePicker={() => setPickerOpenFor(null)}
                        onChangeDay={(newDay) => changeDay(day, newDay)}
                        excludedDays={displayedDays.filter((d) => d !== day)}
                    />
                ))}
                {canAddMore && <AddDayCard onClick={addDay} />}
            </div>
        </>
    );
}

function DayCard({
    day,
    selectedMeals,
    onToggleMeal,
    onRemove,
    pickerOpen,
    onOpenPicker,
    onClosePicker,
    onChangeDay,
    excludedDays,
}: {
    day: string;
    selectedMeals: string[];
    onToggleMeal: (meal: string) => void;
    onRemove: () => void;
    pickerOpen: boolean;
    onOpenPicker: () => void;
    onClosePicker: () => void;
    onChangeDay: (newDay: string) => void;
    excludedDays: string[];
}) {
    const availableDays = DAYS.filter((d) => !excludedDays.includes(d.code));
    return (
        <div className="relative bg-secondary border border-border-color rounded-2xl p-3 flex flex-col gap-2">
            <button
                type="button"
                onClick={onRemove}
                aria-label="Supprimer ce jour"
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary border border-border-color text-text-secondary text-xs font-bold flex items-center justify-center"
            >
                ×
            </button>
            <button
                type="button"
                onClick={pickerOpen ? onClosePicker : onOpenPicker}
                className="text-left font-semibold text-text-primary pr-8 pb-1 border-b border-border-color/50"
            >
                {DAY_LABEL[day]} <span className="text-text-secondary text-xs">{pickerOpen ? "▲" : "▼"}</span>
            </button>
            <div className="flex flex-col gap-1.5">
                {MEAL_CODES.map((meal) => {
                    const active = selectedMeals.includes(meal);
                    return (
                        <button
                            key={meal}
                            type="button"
                            onClick={() => onToggleMeal(meal)}
                            className={`w-full px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                                active
                                    ? "bg-cout-yellow text-cout-purple"
                                    : "bg-primary border border-border-color text-text-primary"
                            }`}
                        >
                            {MEAL_LABEL[meal]}
                        </button>
                    );
                })}
            </div>
            <AnimatePresence>
                {pickerOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute top-full left-0 right-0 mt-1 z-20 bg-secondary border border-border-color rounded-2xl p-2 shadow-lg"
                    >
                        <div className="flex flex-wrap gap-1.5">
                            {availableDays.map((d) => (
                                <button
                                    key={d.code}
                                    type="button"
                                    onClick={() => onChangeDay(d.code)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                        d.code === day
                                            ? "bg-cout-yellow/20 text-cout-purple border border-cout-yellow"
                                            : "bg-primary border border-border-color text-text-primary"
                                    }`}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function AddDayCard({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="bg-secondary border border-dashed border-border-color rounded-2xl flex flex-col items-center justify-center gap-1 text-text-secondary font-semibold min-h-[140px]"
        >
            <span className="text-3xl leading-none">+</span>
            <span className="text-xs">Ajouter</span>
        </button>
    );
}

export function Q8Equipment({ selected, onChange }: { selected: string[]; onChange: (s: string[]) => void }) {
    return (
        <>
            <QuestionTitle>Qu'est-ce que tu as comme équipement ?</QuestionTitle>
            <EquipmentSelector
                selected={selected}
                onChange={onChange}
                title=""
                allowCustom
                customPlaceholder="Autre équipement..."
            />
        </>
    );
}

export function Q9Flavors({ selected, onChange }: { selected: string[]; onChange: (s: string[]) => void }) {
    return (
        <>
            <QuestionTitle>Quelles sont tes préférences dans les saveurs ?</QuestionTitle>
            <ChipToPickList
                items={flavorPreferences}
                selected={selected}
                onChange={onChange}
                otherPlaceholder="Autre saveur..."
            />
        </>
    );
}
