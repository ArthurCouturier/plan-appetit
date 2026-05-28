import { useMemo, useState } from "react";
import {
    useDeleteMealPlanEntry,
    useRitualMealPlanWeek,
    useUpsertMealPlanEntry,
} from "../../api/hooks/useRitualMealPlan";
import { useRitualDailyRange } from "../../api/hooks/useRitualDaily";
import { RitualMealPlanEntryInterface } from "../../api/interfaces/ritual/RitualMealPlanInterface";
import { RitualDailyInterface } from "../../api/interfaces/ritual/RitualDailyInterface";
import { lightHaptic } from "../../haptics/light";
import { errorHaptic } from "../../haptics/error";
import { localIsoDate } from "../../utils/dateUtils";
import DayDetailModal from "./DayDetailModal";

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
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
    const ritualRangeQuery = useRitualDailyRange(from, to);
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

    const ritualAssignmentsByKey = useMemo(() => {
        const map = new Map<string, RitualDailyInterface>();
        ritualRangeQuery.data?.forEach((a) => {
            map.set(`${a.date}-${a.mealType}`, a);
        });
        return map;
    }, [ritualRangeQuery.data]);

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
                    ritualAssignmentsByKey={ritualAssignmentsByKey}
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
