import { useMemo, useState } from "react";
import {
    useDeleteMealPlanEntry,
    useRitualMealPlanWeek,
    useUpsertMealPlanEntry,
} from "../api/hooks/useRitualMealPlan";
import {
    RitualMealPlanEntryInterface,
} from "../api/interfaces/ritual/RitualMealPlanInterface";
import { MealType } from "../api/interfaces/ritual/RitualDailyInterface";
import Modal from "../components/modals/Modal";
import { lightHaptic } from "../haptics/light";
import { errorHaptic } from "../haptics/error";

interface EditingCell {
    date: string;
    mealType: MealType;
    existing: RitualMealPlanEntryInterface | null;
}

const MEAL_TYPES: MealType[] = ["LUNCH", "DINNER"];
const CUSTOM_TEXT_MAX_LENGTH = 100;
const MEAL_LABELS: Record<MealType, string> = {
    LUNCH: "Midi",
    DINNER: "Soir",
    UNSPECIFIED: "",
};
const DAY_LABELS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

function startOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

function isoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
    const out = new Date(d);
    out.setDate(out.getDate() + n);
    return out;
}

function formatDayHeader(d: Date): { label: string; dayNum: number } {
    return { label: DAY_LABELS[(d.getDay() + 6) % 7], dayNum: d.getDate() };
}

export default function RitualCalendarPage() {
    const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
    const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
    const from = isoDate(weekStart);
    const to = isoDate(weekEnd);

    const weekQuery = useRitualMealPlanWeek(from, to);
    const upsert = useUpsertMealPlanEntry(from, to);
    const deleteEntry = useDeleteMealPlanEntry(from, to);

    const [editing, setEditing] = useState<EditingCell | null>(null);

    const days = useMemo(
        () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
        [weekStart],
    );

    const entriesByKey = useMemo(() => {
        const map = new Map<string, RitualMealPlanEntryInterface>();
        weekQuery.data?.entries.forEach((e) => {
            map.set(`${e.date}-${e.mealType}`, e);
        });
        return map;
    }, [weekQuery.data]);

    const today = isoDate(new Date());

    const goPrev = () => { setWeekStart(addDays(weekStart, -7)); lightHaptic(); };
    const goNext = () => { setWeekStart(addDays(weekStart, 7)); lightHaptic(); };
    const goToday = () => { setWeekStart(startOfWeek(new Date())); lightHaptic(); };

    return (
        <div
            className="min-h-screen bg-primary px-4 pb-12"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
        >
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-text-primary text-center mb-2">
                    Mon journal des repas
                </h1>
                <p className="text-text-secondary text-center text-sm mb-6">
                    Garde la trace de ce que tu manges, jour après jour.
                </p>

                <div className="flex items-center justify-between mb-4">
                    <button onClick={goPrev} className="px-3 py-2 rounded-full bg-secondary border border-border-color text-text-primary">←</button>
                    <button onClick={goToday} className="px-4 py-2 rounded-full bg-secondary border border-border-color text-text-primary text-sm font-semibold">
                        {weekRangeLabel(weekStart, weekEnd)}
                    </button>
                    <button onClick={goNext} className="px-3 py-2 rounded-full bg-secondary border border-border-color text-text-primary">→</button>
                </div>

                <div className="flex flex-col gap-2">
                    {days.map((day) => {
                        const dateStr = isoDate(day);
                        const { label, dayNum } = formatDayHeader(day);
                        const isToday = dateStr === today;
                        return (
                            <div
                                key={dateStr}
                                className={`bg-secondary border ${isToday ? "border-cout-yellow" : "border-border-color"} rounded-2xl p-3`}
                            >
                                <div className="flex items-baseline justify-between mb-2">
                                    <span className="text-xs uppercase tracking-wider text-text-secondary">
                                        {label}
                                    </span>
                                    <span className={`text-lg font-bold ${isToday ? "text-cout-yellow" : "text-text-primary"}`}>
                                        {dayNum}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {MEAL_TYPES.map((mealType) => {
                                        const entry = entriesByKey.get(`${dateStr}-${mealType}`) ?? null;
                                        return (
                                            <MealCell
                                                key={mealType}
                                                mealType={mealType}
                                                entry={entry}
                                                onClick={() => setEditing({ date: dateStr, mealType, existing: entry })}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {weekQuery.isLoading && (
                    <p className="text-center text-text-secondary text-sm mt-6">Chargement...</p>
                )}
            </div>

            {editing && (
                <EditCellModal
                    cell={editing}
                    onClose={() => setEditing(null)}
                    onSave={async (payload) => {
                        try {
                            await upsert.mutateAsync({
                                date: editing.date,
                                mealType: editing.mealType,
                                ...payload,
                            });
                            lightHaptic();
                            setEditing(null);
                        } catch (e) {
                            errorHaptic();
                        }
                    }}
                    onDelete={async () => {
                        try {
                            await deleteEntry.mutateAsync({
                                date: editing.date,
                                mealType: editing.mealType,
                            });
                            lightHaptic();
                            setEditing(null);
                        } catch (e) {
                            errorHaptic();
                        }
                    }}
                    isSaving={upsert.isPending}
                    isDeleting={deleteEntry.isPending}
                />
            )}
        </div>
    );
}

function MealCell({
    mealType,
    entry,
    onClick,
}: {
    mealType: MealType;
    entry: RitualMealPlanEntryInterface | null;
    onClick: () => void;
}) {
    const label = MEAL_LABELS[mealType];
    return (
        <button
            type="button"
            onClick={() => { onClick(); lightHaptic(); }}
            className="text-left bg-primary border border-border-color rounded-xl p-2 min-h-[64px] flex flex-col justify-between hover:border-cout-yellow transition-colors"
        >
            <span className="text-[10px] uppercase tracking-wider text-text-secondary">{label}</span>
            <span className="text-sm text-text-primary line-clamp-2">
                {entry?.isSkipped && "🚫 Sauté"}
                {entry?.recipeName && entry.recipeName}
                {entry?.customText && entry.customText}
                {!entry && <span className="text-text-secondary">+ Remplir</span>}
            </span>
        </button>
    );
}

function weekRangeLabel(from: Date, to: Date): string {
    const f = from.getDate();
    const t = to.getDate();
    const month = to.toLocaleDateString("fr-FR", { month: "long" });
    return `${f} - ${t} ${month}`;
}

interface EditCellModalProps {
    cell: EditingCell;
    onClose: () => void;
    onSave: (payload: { customText?: string; isSkipped?: boolean }) => Promise<void>;
    onDelete: () => Promise<void>;
    isSaving: boolean;
    isDeleting: boolean;
}

function EditCellModal({ cell, onClose, onSave, onDelete, isSaving, isDeleting }: EditCellModalProps) {
    const [text, setText] = useState(cell.existing?.customText ?? "");

    const handleSaveText = () => {
        const trimmed = text.trim();
        if (!trimmed) {
            errorHaptic();
            return;
        }
        onSave({ customText: trimmed, isSkipped: false });
    };

    const handleSkip = () => onSave({ isSkipped: true });

    return (
        <Modal isOpen onClose={onClose} title={`${MEAL_LABELS[cell.mealType]} du ${cell.date}`} size="sm">
            <div className="p-6 max-w-sm w-full">
                <p className="text-text-secondary text-sm mb-4">
                    Renseigne ce que tu as mangé ou prévois de manger.
                </p>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Qu'est-ce qu'on mange ?
                </label>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="ex: pâtes au pesto"
                    maxLength={CUSTOM_TEXT_MAX_LENGTH}
                    className="w-full px-4 py-3 bg-secondary border border-border-color rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-cout-yellow"
                    autoFocus
                />
                <div className="text-xs text-text-secondary text-right mt-1">
                    {text.length} / {CUSTOM_TEXT_MAX_LENGTH}
                </div>
                <button
                    type="button"
                    onClick={handleSaveText}
                    disabled={isSaving || !text.trim()}
                    className="mt-4 w-full px-4 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                >
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                </button>
                <div className="my-4 flex items-center gap-2">
                    <div className="flex-1 h-px bg-border-color" />
                    <span className="text-text-secondary text-xs">ou</span>
                    <div className="flex-1 h-px bg-border-color" />
                </div>
                <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 rounded-full bg-secondary border border-border-color text-text-primary text-sm font-semibold"
                >
                    🚫 Je n'ai pas mangé / Sauté
                </button>
                {cell.existing && (
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="mt-2 w-full px-4 py-2 text-cancel-1 text-sm font-semibold"
                    >
                        {isDeleting ? "Suppression..." : "Effacer cette entrée"}
                    </button>
                )}
            </div>
        </Modal>
    );
}
