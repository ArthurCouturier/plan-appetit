import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    useDeleteMealPlanEntry,
    useRitualMealPlanWeek,
    useUpsertMealPlanEntry,
} from "../../api/hooks/useRitualMealPlan";
import { RitualMealPlanEntryInterface } from "../../api/interfaces/ritual/RitualMealPlanInterface";
import { MealType } from "../../api/interfaces/ritual/RitualDailyInterface";
import Modal from "../modals/Modal";
import { lightHaptic } from "../../haptics/light";
import { errorHaptic } from "../../haptics/error";
import { localIsoDate } from "../../utils/dateUtils";

const MEAL_TYPES: MealType[] = ["LUNCH", "DINNER"];
const CUSTOM_TEXT_MAX_LENGTH = 250;
const LENGTH_ERROR_DURATION_MS = 5000;
const MEAL_LABELS: Record<MealType, string> = {
    LUNCH: "Midi",
    DINNER: "Soir",
    UNSPECIFIED: "",
};
const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const FULL_DAY_LABELS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const FRENCH_MONTHS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const WEEKS_PER_BLOCK = 4;

function startOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d;
}

function addDays(d: Date, n: number): Date {
    const out = new Date(d);
    out.setDate(out.getDate() + n);
    return out;
}

function parseLocalDate(iso: string): Date {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
}

export default function RitualMonthCalendar() {
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => startOfWeek(new Date()));
    const blockStart = useMemo(
        () => addDays(currentWeekStart, -(WEEKS_PER_BLOCK - 1) * 7),
        [currentWeekStart],
    );
    const blockEnd = useMemo(
        () => addDays(currentWeekStart, 6),
        [currentWeekStart],
    );
    const from = localIsoDate(blockStart);
    const to = localIsoDate(blockEnd);

    const weekQuery = useRitualMealPlanWeek(from, to);
    const upsert = useUpsertMealPlanEntry(from, to);
    const deleteEntry = useDeleteMealPlanEntry(from, to);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const weeks = useMemo(() => {
        return Array.from({ length: WEEKS_PER_BLOCK }, (_, weekIdx) => {
            const weekStart = addDays(blockStart, weekIdx * 7);
            return Array.from({ length: 7 }, (_, dayIdx) => addDays(weekStart, dayIdx));
        });
    }, [blockStart]);

    const entriesByKey = useMemo(() => {
        const map = new Map<string, RitualMealPlanEntryInterface>();
        weekQuery.data?.entries.forEach((e) => {
            map.set(`${e.date}-${e.mealType}`, e);
        });
        return map;
    }, [weekQuery.data]);

    const today = localIsoDate(new Date());

    const goPrev = () => {
        setCurrentWeekStart(addDays(currentWeekStart, -WEEKS_PER_BLOCK * 7));
        lightHaptic();
    };
    const goNext = () => {
        setCurrentWeekStart(addDays(currentWeekStart, WEEKS_PER_BLOCK * 7));
        lightHaptic();
    };
    const goToday = () => {
        setCurrentWeekStart(startOfWeek(new Date()));
        lightHaptic();
    };

    const isCurrentBlock = localIsoDate(currentWeekStart) === localIsoDate(startOfWeek(new Date()));

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <button
                    onClick={goPrev}
                    className="px-3 py-2 rounded-full bg-secondary border border-border-color text-text-primary"
                    aria-label="Bloc précédent"
                >
                    ←
                </button>
                <button
                    onClick={goToday}
                    disabled={isCurrentBlock}
                    className="px-4 py-2 rounded-full bg-secondary border border-border-color text-text-primary text-sm font-semibold disabled:opacity-50"
                >
                    {blockRangeLabel(blockStart, blockEnd)}
                </button>
                <button
                    onClick={goNext}
                    className="px-3 py-2 rounded-full bg-secondary border border-border-color text-text-primary"
                    aria-label="Bloc suivant"
                >
                    →
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_LABELS.map((label, i) => (
                    <div
                        key={i}
                        className="text-center text-[10px] font-semibold text-text-secondary uppercase tracking-wider"
                    >
                        {label}
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-1">
                {weeks.map((days, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7 gap-1">
                        {days.map((day) => {
                            const dateStr = localIsoDate(day);
                            const hasLunch = entriesByKey.has(`${dateStr}-LUNCH`);
                            const hasDinner = entriesByKey.has(`${dateStr}-DINNER`);
                            const isToday = dateStr === today;
                            return (
                                <DayCell
                                    key={dateStr}
                                    day={day}
                                    hasLunch={hasLunch}
                                    hasDinner={hasDinner}
                                    isToday={isToday}
                                    onClick={() => {
                                        setSelectedDate(dateStr);
                                        lightHaptic();
                                    }}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {weekQuery.isLoading && (
                <p className="text-center text-text-secondary text-sm mt-3">Chargement...</p>
            )}

            {selectedDate && (
                <DayDetailModal
                    date={selectedDate}
                    blockStart={blockStart}
                    blockEnd={blockEnd}
                    entriesByKey={entriesByKey}
                    onClose={() => setSelectedDate(null)}
                    onNavigate={(newDate) => setSelectedDate(newDate)}
                    onUpsert={async (date, mealType, payload) => {
                        try {
                            await upsert.mutateAsync({ date, mealType, ...payload });
                        } catch {
                            errorHaptic();
                        }
                    }}
                    onDelete={async (date, mealType) => {
                        try {
                            await deleteEntry.mutateAsync({ date, mealType });
                        } catch {
                            errorHaptic();
                        }
                    }}
                />
            )}
        </div>
    );
}

function DayCell({
    day,
    hasLunch,
    hasDinner,
    isToday,
    onClick,
}: {
    day: Date;
    hasLunch: boolean;
    hasDinner: boolean;
    isToday: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`aspect-square flex flex-col items-center justify-between p-1.5 rounded-lg border transition-colors ${
                isToday
                    ? "border-cout-yellow bg-secondary"
                    : "border-border-color bg-secondary hover:border-cout-yellow"
            }`}
        >
            <span
                className={`text-sm font-bold ${isToday ? "text-cout-yellow" : "text-text-primary"}`}
            >
                {day.getDate()}
            </span>
            <div className="flex gap-1 items-center justify-center h-1.5">
                <span
                    className={`w-1.5 h-1.5 rounded-full ${
                        hasLunch ? "bg-cout-yellow" : "bg-transparent"
                    }`}
                />
                <span
                    className={`w-1.5 h-1.5 rounded-full ${
                        hasDinner ? "bg-cout-yellow" : "bg-transparent"
                    }`}
                />
            </div>
        </button>
    );
}

function blockRangeLabel(from: Date, to: Date): string {
    const f = from.getDate();
    const t = to.getDate();
    const fMonth = FRENCH_MONTHS[from.getMonth()];
    const tMonth = FRENCH_MONTHS[to.getMonth()];
    if (from.getMonth() === to.getMonth()) {
        return `${f} - ${t} ${tMonth}`;
    }
    return `${f} ${fMonth} - ${t} ${tMonth}`;
}

interface DayDetailModalProps {
    date: string;
    blockStart: Date;
    blockEnd: Date;
    entriesByKey: Map<string, RitualMealPlanEntryInterface>;
    onClose: () => void;
    onNavigate: (newDate: string) => void;
    onUpsert: (
        date: string,
        mealType: MealType,
        payload: { customText?: string; isSkipped?: boolean },
    ) => Promise<void>;
    onDelete: (date: string, mealType: MealType) => Promise<void>;
}

interface MealLocalState {
    text: string;
    isSkipped: boolean;
}

function entryToState(entry: RitualMealPlanEntryInterface | null): MealLocalState {
    if (!entry) return { text: "", isSkipped: false };
    return {
        text: entry.customText ?? "",
        isSkipped: entry.isSkipped,
    };
}

function statesEqual(a: MealLocalState, b: MealLocalState): boolean {
    return a.text === b.text && a.isSkipped === b.isSkipped;
}

function initStates(
    date: string,
    entriesByKey: Map<string, RitualMealPlanEntryInterface>,
): Record<MealType, MealLocalState> {
    return Object.fromEntries(
        MEAL_TYPES.map((mt) => [mt, entryToState(entriesByKey.get(`${date}-${mt}`) ?? null)]),
    ) as Record<MealType, MealLocalState>;
}

function DayDetailModal({
    date,
    blockStart,
    blockEnd,
    entriesByKey,
    onClose,
    onNavigate,
    onUpsert,
    onDelete,
}: DayDetailModalProps) {
    const dateObj = parseLocalDate(date);
    const dayOfWeekIdx = (dateObj.getDay() + 6) % 7;
    const dayLabel = FULL_DAY_LABELS[dayOfWeekIdx];
    const monthLabel = FRENCH_MONTHS[dateObj.getMonth()];
    const dayName = `${capitalize(dayLabel)} ${dateObj.getDate()} ${monthLabel}`;

    const prevDate = localIsoDate(addDays(dateObj, -1));
    const nextDate = localIsoDate(addDays(dateObj, 1));
    const canGoPrev = parseLocalDate(prevDate) >= blockStart;
    const canGoNext = parseLocalDate(nextDate) <= blockEnd;

    const [states, setStates] = useState<Record<MealType, MealLocalState>>(() =>
        initStates(date, entriesByKey),
    );

    const statesRef = useRef(states);
    statesRef.current = states;
    const dateRef = useRef(date);
    dateRef.current = date;
    const entriesByKeyRef = useRef(entriesByKey);
    entriesByKeyRef.current = entriesByKey;

    useEffect(() => {
        setStates(initStates(date, entriesByKey));
    }, [date]);

    const persistCurrent = useCallback(() => {
        const currentStates = statesRef.current;
        const currentDate = dateRef.current;
        const currentEntries = entriesByKeyRef.current;
        for (const mt of MEAL_TYPES) {
            const state = currentStates[mt];
            const original = currentEntries.get(`${currentDate}-${mt}`) ?? null;
            if (statesEqual(state, entryToState(original))) continue;
            const trimmed = state.text.trim();
            const hasContent = trimmed.length > 0 || state.isSkipped;
            if (!hasContent) {
                if (original) void onDelete(currentDate, mt);
            } else {
                void onUpsert(currentDate, mt, {
                    customText: trimmed || undefined,
                    isSkipped: state.isSkipped,
                });
            }
        }
    }, [onUpsert, onDelete]);

    const handleClose = () => {
        persistCurrent();
        onClose();
    };

    const handleNavigate = (newDate: string) => {
        lightHaptic();
        persistCurrent();
        onNavigate(newDate);
    };

    const setMealState = (mt: MealType, updater: (s: MealLocalState) => MealLocalState) => {
        setStates((s) => ({ ...s, [mt]: updater(s[mt]) }));
    };

    const titleNode = (
        <span className="flex items-center gap-2 text-base font-bold text-text-primary">
            <button
                type="button"
                onClick={() => canGoPrev && handleNavigate(prevDate)}
                disabled={!canGoPrev}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary border border-border-color text-text-primary text-sm disabled:opacity-30"
                aria-label="Jour précédent"
            >
                ←
            </button>
            <button
                type="button"
                onClick={() => canGoNext && handleNavigate(nextDate)}
                disabled={!canGoNext}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary border border-border-color text-text-primary text-sm disabled:opacity-30"
                aria-label="Jour suivant"
            >
                →
            </button>
            <span className="ml-1 truncate">{dayName}</span>
        </span>
    );

    return (
        <Modal isOpen onClose={handleClose} title={titleNode} size="sm">
            <div className="px-4 py-2 max-w-sm w-full space-y-5">
                {MEAL_TYPES.map((mt) => {
                    const entry = entriesByKey.get(`${date}-${mt}`) ?? null;
                    return (
                        <MealSection
                            key={`${date}-${mt}`}
                            mealType={mt}
                            state={states[mt]}
                            recipeName={entry?.recipeName ?? null}
                            onChange={(updater) => setMealState(mt, updater)}
                        />
                    );
                })}
            </div>
        </Modal>
    );
}

interface MealSectionProps {
    mealType: MealType;
    state: MealLocalState;
    recipeName: string | null;
    onChange: (updater: (s: MealLocalState) => MealLocalState) => void;
}

function MealSection({ mealType, state, recipeName, onChange }: MealSectionProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [showLengthError, setShowLengthError] = useState(false);
    const errorTimerRef = useRef<number | null>(null);

    const isAtMax = state.text.length >= CUSTOM_TEXT_MAX_LENGTH;

    useEffect(() => {
        return () => {
            if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
        };
    }, []);

    const handleFocus = () => {
        const input = inputRef.current;
        if (!input) return;
        window.setTimeout(() => {
            input.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 200);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const next = e.target.value;
        onChange((s) => ({ ...s, text: next }));
        if (next.length >= CUSTOM_TEXT_MAX_LENGTH) {
            setShowLengthError(true);
            if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
            errorTimerRef.current = window.setTimeout(
                () => setShowLengthError(false),
                LENGTH_ERROR_DURATION_MS,
            );
        }
    };

    const handleClear = () => {
        onChange((s) => ({ ...s, text: "" }));
        setShowLengthError(false);
        if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current);
        inputRef.current?.focus();
    };

    const toggleSkip = () => {
        onChange((s) => ({ ...s, isSkipped: !s.isSkipped }));
        lightHaptic();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                        {MEAL_LABELS[mealType]}
                    </span>
                    {recipeName && (
                        <span className="text-xs text-text-secondary line-clamp-1">
                            {recipeName}
                        </span>
                    )}
                </div>
                <button
                    type="button"
                    onClick={toggleSkip}
                    className="flex items-center gap-2 shrink-0"
                    aria-label="Repas sauté"
                >
                    <span className="text-xs text-text-secondary">Sauté</span>
                    <span
                        className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
                            state.isSkipped ? "bg-cout-yellow" : "bg-border-color"
                        }`}
                    >
                        <span
                            className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                                state.isSkipped ? "translate-x-4" : "translate-x-0"
                            }`}
                        />
                    </span>
                </button>
            </div>

            <div
                className={`overflow-hidden transition-all duration-200 ease-out ${
                    state.isSkipped ? "max-h-0 opacity-0" : "max-h-48 opacity-100"
                }`}
            >
                <div className="relative">
                    <textarea
                        ref={inputRef}
                        rows={3}
                        value={state.text}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        placeholder="ex: pâtes au pesto"
                        maxLength={CUSTOM_TEXT_MAX_LENGTH}
                        className={`w-full px-4 py-3 pr-10 bg-secondary border rounded-xl text-text-primary placeholder-text-secondary focus:outline-none text-base resize-none leading-snug transition-colors ${
                            isAtMax
                                ? "border-cancel-1 focus:border-cancel-1"
                                : "border-border-color focus:border-cout-yellow"
                        }`}
                    />
                    {state.text && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-2.5 top-2.5 w-5 h-5 rounded-full bg-text-secondary/40 hover:bg-text-secondary/60 flex items-center justify-center text-primary text-xs leading-none"
                            aria-label="Effacer le texte"
                        >
                            ×
                        </button>
                    )}
                </div>
                {showLengthError && (
                    <p className="text-xs text-cancel-1 mt-1">Trop long</p>
                )}
            </div>

            <div
                className={`overflow-hidden transition-all duration-200 ease-out ${
                    state.isSkipped ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <p className="text-text-secondary italic text-sm py-3">
                    🚫 Repas sauté
                </p>
            </div>
        </div>
    );
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
