import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ChipToPickList from "../components/common/ChipToPickList";
import EquipmentSelector from "../components/shared/EquipmentSelector";
import SteppedSlider from "../components/fields/SteppedSlider";
import dietaryRestrictionsAndAllergies from "../data/dietaryRestrictionsAndAllergies.json";
import flavorPreferences from "../data/flavorPreferences.json";
import {
    useCompleteCulinaryOnboarding,
    useCulinaryProfile,
    useUpdateCulinaryProfile,
} from "../api/hooks/useCulinaryProfile";
import type {
    CookingLevel,
    UpdateUserCulinaryProfileRequest,
} from "../api/interfaces/users/UserCulinaryProfileInterface";
import type { BudgetTarget } from "../api/interfaces/batchcooking/BatchCookingInterfaces";
import { lightHaptic } from "../haptics/light";
import { mediumHaptic } from "../haptics/medium";
import { errorHaptic } from "../haptics/error";

const NONE_RESTRICTION = "Aucune restriction";
const TIME_STEPS = [5, 10, 15, 20, 30, 45, 60, 90, 120];
const STORAGE_KEY = "ritualOnboardingDraft";
const TOTAL_QUESTIONS = 9;

interface Draft {
    householdSize: number;
    dietaryRestrictions: string[];
    customRestrictions: string;
    budgetTarget: BudgetTarget;
    cookingLevel: CookingLevel;
    timeLunchWeekdayMin: number;
    timeDinnerWeekdayMin: number;
    ambitiousMeals: string[];
    equipment: string[];
    flavorPreferences: string[];
}

const DEFAULT_DRAFT: Draft = {
    householdSize: 1,
    dietaryRestrictions: [],
    customRestrictions: "",
    budgetTarget: "BALANCED",
    cookingLevel: "INTERMEDIATE",
    timeLunchWeekdayMin: 20,
    timeDinnerWeekdayMin: 45,
    ambitiousMeals: [],
    equipment: ["Four", "Poêle", "Casserole"],
    flavorPreferences: [],
};

const DAYS: { code: string; label: string }[] = [
    { code: "MON", label: "Lundi" },
    { code: "TUE", label: "Mardi" },
    { code: "WED", label: "Mercredi" },
    { code: "THU", label: "Jeudi" },
    { code: "FRI", label: "Vendredi" },
    { code: "SAT", label: "Samedi" },
    { code: "SUN", label: "Dimanche" },
];
const DEFAULT_AMBITIOUS_DAYS = ["SAT", "SUN"];
const MEAL_CODES = ["LUNCH", "DINNER"] as const;
const MEAL_LABEL: Record<string, string> = { LUNCH: "Midi", DINNER: "Soir" };
const DAY_LABEL: Record<string, string> = Object.fromEntries(DAYS.map((d) => [d.code, d.label]));

type StepKind = "intro" | "question" | "recap";

interface Step {
    kind: StepKind;
    questionIndex?: number;
}

export default function RitualOnboarding() {
    const navigate = useNavigate();
    const { data: existingProfile } = useCulinaryProfile();
    const updateMutation = useUpdateCulinaryProfile();
    const completeMutation = useCompleteCulinaryOnboarding();

    const [draft, setDraft] = useState<Draft>(() => loadDraft() ?? DEFAULT_DRAFT);
    const [step, setStep] = useState<Step>({ kind: "intro" });
    const [editingFromRecap, setEditingFromRecap] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (existingProfile && !loadDraft()) {
            setDraft(profileToDraft(existingProfile));
        }
    }, [existingProfile]);

    useEffect(() => {
        saveDraft(draft);
    }, [draft]);

    const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
        setDraft((d) => ({ ...d, [key]: value }));
    };

    const q2HasValidAnswer = useMemo(
        () => draft.dietaryRestrictions.length > 0 || draft.customRestrictions.trim().length > 0,
        [draft.dietaryRestrictions, draft.customRestrictions],
    );

    const handleQ2Change = (selected: string[]) => {
        update("dietaryRestrictions", selected);
    };

    const goNext = () => {
        if (step.kind === "intro") {
            setStep({ kind: "question", questionIndex: 0 });
            lightHaptic();
            return;
        }
        if (step.kind === "question") {
            const idx = step.questionIndex ?? 0;
            if (idx === 1 && !q2HasValidAnswer) {
                errorHaptic();
                return;
            }
            if (editingFromRecap) {
                setStep({ kind: "recap" });
                setEditingFromRecap(false);
                lightHaptic();
                return;
            }
            if (idx + 1 >= TOTAL_QUESTIONS) {
                setStep({ kind: "recap" });
                mediumHaptic();
                return;
            }
            setStep({ kind: "question", questionIndex: idx + 1 });
            lightHaptic();
            return;
        }
    };

    const goPrev = () => {
        if (step.kind === "question") {
            const idx = step.questionIndex ?? 0;
            if (editingFromRecap) {
                setStep({ kind: "recap" });
                setEditingFromRecap(false);
                return;
            }
            if (idx === 0) {
                setStep({ kind: "intro" });
                return;
            }
            setStep({ kind: "question", questionIndex: idx - 1 });
            return;
        }
        if (step.kind === "recap") {
            setStep({ kind: "question", questionIndex: TOTAL_QUESTIONS - 1 });
            return;
        }
    };

    const jumpToQuestion = (idx: number) => {
        setEditingFromRecap(true);
        setStep({ kind: "question", questionIndex: idx });
        lightHaptic();
    };

    const handleSubmit = async () => {
        setSubmitError(null);
        try {
            const body: UpdateUserCulinaryProfileRequest = {
                householdSize: draft.householdSize,
                dietaryRestrictions: draft.dietaryRestrictions,
                customRestrictions: draft.customRestrictions.trim() || undefined,
                budgetTarget: draft.budgetTarget,
                cookingLevel: draft.cookingLevel,
                timeLunchWeekdayMin: draft.timeLunchWeekdayMin,
                timeDinnerWeekdayMin: draft.timeDinnerWeekdayMin,
                ambitiousMeals: draft.ambitiousMeals,
                equipment: draft.equipment,
                flavorPreferences: draft.flavorPreferences,
            };
            await updateMutation.mutateAsync(body);
            await completeMutation.mutateAsync();
            clearDraft();
            navigate("/ritual");
        } catch (e) {
            setSubmitError(e instanceof Error ? e.message : "Erreur inconnue");
            errorHaptic();
        }
    };

    const isSubmitting = updateMutation.isPending || completeMutation.isPending;
    const showNext = step.kind === "intro" || step.kind === "question";
    const nextDisabled = step.kind === "question" && step.questionIndex === 1 && !q2HasValidAnswer;
    const nextLabel = step.kind === "intro"
        ? "C'est parti"
        : editingFromRecap
            ? "Retour au récap"
            : step.kind === "question" && step.questionIndex === TOTAL_QUESTIONS - 1
                ? "Voir le récap"
                : "Suivant";

    return (
        <div className="min-h-screen flex flex-col bg-primary">
            <div
                className="px-4 pb-2"
                style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
            >
                {step.kind === "question" && (
                    <ProgressHeader
                        current={(step.questionIndex ?? 0) + 1}
                        total={TOTAL_QUESTIONS}
                    />
                )}
            </div>

            <div className="flex-1 flex flex-col px-4 pb-32 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={stepKey(step)}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col"
                    >
                        {step.kind === "intro" && <IntroScreen />}
                        {step.kind === "question" && (
                            <QuestionScreen
                                index={step.questionIndex ?? 0}
                                draft={draft}
                                update={update}
                                onQ2Change={handleQ2Change}
                            />
                        )}
                        {step.kind === "recap" && (
                            <RecapScreen
                                draft={draft}
                                onJump={jumpToQuestion}
                                onSubmit={handleSubmit}
                                isSubmitting={isSubmitting}
                                error={submitError}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {(showNext || step.kind === "recap") && (
                <div
                    className="fixed bottom-0 left-0 right-0 bg-primary border-t border-border-color px-4 pt-3"
                    style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
                >
                    <div className="max-w-md mx-auto flex gap-3">
                        {(step.kind === "question" || step.kind === "recap") && !editingFromRecap && (
                            <button
                                type="button"
                                onClick={goPrev}
                                className="px-5 py-3 rounded-full bg-secondary border border-border-color text-text-primary font-semibold"
                            >
                                ←
                            </button>
                        )}
                        {showNext && (
                            <button
                                type="button"
                                onClick={goNext}
                                disabled={nextDisabled}
                                className="flex-1 px-5 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {nextLabel}
                            </button>
                        )}
                    </div>
                    {nextDisabled && (
                        <p className="text-xs text-cancel-1 text-center mt-2 max-w-md mx-auto">
                            Sélectionne au moins une option (ou « Aucune restriction »).
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

function stepKey(step: Step): string {
    if (step.kind === "question") return `q-${step.questionIndex}`;
    return step.kind;
}

function ProgressHeader({ current, total }: { current: number; total: number }) {
    const pct = Math.round((current / total) * 100);
    return (
        <div className="max-w-md mx-auto">
            <div className="flex justify-between text-xs text-text-secondary mb-1.5">
                <span>{current} / {total}</span>
                <span>{pct}%</span>
            </div>
            <div className="h-1.5 bg-border-color rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-cout-yellow"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>
    );
}

function IntroScreen() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-text-primary mb-4">
                On personnalise tes recettes en 2 minutes
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed">
                9 questions rapides pour qu'on te propose les bonnes idées tous les jours, adaptées à toi.
            </p>
        </div>
    );
}

interface QuestionScreenProps {
    index: number;
    draft: Draft;
    update: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
    onQ2Change: (selected: string[]) => void;
}

function QuestionScreen({ index, draft, update, onQ2Change }: QuestionScreenProps) {
    return (
        <div className="max-w-md mx-auto w-full pt-4">
            {index === 0 && (
                <Q1Household value={draft.householdSize} onChange={(v) => update("householdSize", v)} />
            )}
            {index === 1 && (
                <Q2Restrictions
                    selected={draft.dietaryRestrictions}
                    onChange={onQ2Change}
                    customValue={draft.customRestrictions}
                    onCustomChange={(v) => update("customRestrictions", v)}
                />
            )}
            {index === 2 && (
                <Q3Budget value={draft.budgetTarget} onChange={(v) => update("budgetTarget", v)} />
            )}
            {index === 3 && (
                <Q4CookingLevel value={draft.cookingLevel} onChange={(v) => update("cookingLevel", v)} />
            )}
            {index === 4 && (
                <Q5TimeLunch
                    value={draft.timeLunchWeekdayMin}
                    onChange={(v) => update("timeLunchWeekdayMin", v)}
                />
            )}
            {index === 5 && (
                <Q6TimeDinner
                    value={draft.timeDinnerWeekdayMin}
                    onChange={(v) => update("timeDinnerWeekdayMin", v)}
                />
            )}
            {index === 6 && (
                <Q7AmbitiousMeals
                    value={draft.ambitiousMeals}
                    onChange={(v) => update("ambitiousMeals", v)}
                />
            )}
            {index === 7 && (
                <Q8Equipment
                    selected={draft.equipment}
                    onChange={(v) => update("equipment", v)}
                />
            )}
            {index === 8 && (
                <Q9Flavors
                    selected={draft.flavorPreferences}
                    onChange={(v) => update("flavorPreferences", v)}
                />
            )}
        </div>
    );
}

function QuestionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
            {children}
        </h2>
    );
}

function Q1Household({ value, onChange }: { value: number; onChange: (v: number) => void }) {
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

function Q2Restrictions({
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

function Q3Budget({ value, onChange }: { value: BudgetTarget; onChange: (v: BudgetTarget) => void }) {
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

function Q4CookingLevel({
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

function Q5TimeLunch({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <>
            <QuestionTitle>Le midi en semaine, combien de temps tu as pour cuisiner ?</QuestionTitle>
            <SteppedSlider value={value} onChange={onChange} steps={TIME_STEPS} suffix=" min" />
        </>
    );
}

function Q6TimeDinner({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <>
            <QuestionTitle>Et le soir en semaine ?</QuestionTitle>
            <SteppedSlider value={value} onChange={onChange} steps={TIME_STEPS} suffix=" min" />
        </>
    );
}

function Q7AmbitiousMeals({
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

function sortDays(days: string[]): string[] {
    const order = Object.fromEntries(DAYS.map((d, i) => [d.code, i]));
    return [...days].sort((a, b) => order[a] - order[b]);
}

function arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((v, i) => v === b[i]);
}

function Q8Equipment({ selected, onChange }: { selected: string[]; onChange: (s: string[]) => void }) {
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

function Q9Flavors({ selected, onChange }: { selected: string[]; onChange: (s: string[]) => void }) {
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

interface RecapScreenProps {
    draft: Draft;
    onJump: (idx: number) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    error: string | null;
}

function RecapScreen({ draft, onJump, onSubmit, isSubmitting, error }: RecapScreenProps) {
    const lines = useMemo(() => [
        { idx: 0, label: "Personnes à table", value: draft.householdSize === 6 ? "6+" : String(draft.householdSize) },
        {
            idx: 1,
            label: "Restrictions / allergies",
            value: formatList([...draft.dietaryRestrictions, draft.customRestrictions.trim()].filter(Boolean)),
        },
        { idx: 2, label: "Budget", value: budgetLabel(draft.budgetTarget) },
        { idx: 3, label: "Niveau cuisine", value: cookingLevelLabel(draft.cookingLevel) },
        { idx: 4, label: "Temps midi semaine", value: `${draft.timeLunchWeekdayMin} min` },
        { idx: 5, label: "Temps soir semaine", value: `${draft.timeDinnerWeekdayMin} min` },
        {
            idx: 6,
            label: "Repas ambitieux",
            value: formatAmbitiousMeals(draft.ambitiousMeals),
        },
        { idx: 7, label: "Équipement", value: formatList(draft.equipment) },
        { idx: 8, label: "Saveurs préférées", value: formatList(draft.flavorPreferences) },
    ], [draft]);

    return (
        <div className="max-w-md mx-auto w-full pt-4">
            <h2 className="text-2xl font-bold text-text-primary text-center mb-2">
                Voilà ce qu'on sait de toi
            </h2>
            <p className="text-text-secondary text-sm text-center mb-6">
                Tape une ligne pour la modifier.
            </p>
            <div className="flex flex-col gap-2 mb-6">
                {lines.map((line) => (
                    <button
                        key={line.idx}
                        onClick={() => onJump(line.idx)}
                        className="flex justify-between items-center gap-3 px-4 py-3 rounded-xl bg-secondary border border-border-color text-left"
                    >
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs text-text-secondary">{line.label}</span>
                            <span className="text-sm font-semibold text-text-primary truncate">
                                {line.value || "—"}
                            </span>
                        </div>
                        <span className="text-text-secondary">›</span>
                    </button>
                ))}
            </div>
            {error && (
                <p className="text-sm text-cancel-1 text-center mb-3">{error}</p>
            )}
            <button
                type="button"
                onClick={onSubmit}
                disabled={isSubmitting}
                className="w-full px-5 py-4 rounded-full bg-cout-yellow text-cout-purple font-bold text-lg disabled:opacity-50"
            >
                {isSubmitting ? "Sauvegarde..." : "Tout est bon, génère ma 1ère recette"}
            </button>
        </div>
    );
}

function formatList(values: string[]): string {
    if (values.length === 0) return "Aucune préférence";
    if (values.length <= 3) return values.join(", ");
    return `${values.slice(0, 3).join(", ")} +${values.length - 3}`;
}

function formatAmbitiousMeals(codes: string[]): string {
    if (codes.length === 0) return "Aucun";
    const grouped = new Map<string, string[]>();
    for (const code of codes) {
        const [day, meal] = code.split("_");
        const meals = grouped.get(day) ?? [];
        meals.push(meal);
        grouped.set(day, meals);
    }
    const ordered = sortDays(Array.from(grouped.keys()));
    return ordered
        .map((day) => {
            const meals = grouped.get(day)!.map((m) => MEAL_LABEL[m].toLowerCase()).join(" + ");
            return `${DAY_LABEL[day]} (${meals})`;
        })
        .join(", ");
}

function budgetLabel(b: BudgetTarget): string {
    if (b === "ECONOMICAL") return "Éco (< 3 €)";
    if (b === "BALANCED") return "Équilibré (3-6 €)";
    return "Confort (6 € +)";
}

function cookingLevelLabel(c: CookingLevel): string {
    if (c === "BEGINNER") return "Je débute";
    if (c === "INTERMEDIATE") return "Je sais faire pas mal de trucs";
    return "Je maîtrise";
}

function loadDraft(): Draft | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        return {
            ...DEFAULT_DRAFT,
            ...parsed,
            dietaryRestrictions: asStringArray(parsed.dietaryRestrictions),
            ambitiousMeals: asStringArray(parsed.ambitiousMeals),
            equipment: asStringArray(parsed.equipment),
            flavorPreferences: asStringArray(parsed.flavorPreferences),
        } as Draft;
    } catch {
        return null;
    }
}

function asStringArray(v: unknown): string[] {
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

function saveDraft(draft: Draft) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
        // ignore quota / private-mode errors
    }
}

function clearDraft() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
}

function profileToDraft(p: {
    householdSize: number;
    dietaryRestrictions: string[];
    customRestrictions: string | null;
    budgetTarget: BudgetTarget;
    cookingLevel: CookingLevel;
    timeLunchWeekdayMin: number;
    timeDinnerWeekdayMin: number;
    ambitiousMeals: string[];
    equipment: string[];
    flavorPreferences: string[];
}): Draft {
    return {
        householdSize: p.householdSize,
        dietaryRestrictions: p.dietaryRestrictions,
        customRestrictions: p.customRestrictions ?? "",
        budgetTarget: p.budgetTarget,
        cookingLevel: p.cookingLevel,
        timeLunchWeekdayMin: p.timeLunchWeekdayMin,
        timeDinnerWeekdayMin: p.timeDinnerWeekdayMin,
        ambitiousMeals: p.ambitiousMeals,
        equipment: p.equipment,
        flavorPreferences: p.flavorPreferences,
    };
}
