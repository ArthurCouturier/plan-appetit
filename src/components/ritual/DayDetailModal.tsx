import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { RitualMealPlanEntryInterface } from "../../api/interfaces/ritual/RitualMealPlanInterface";
import {
    MealType,
    RitualDailyInterface,
} from "../../api/interfaces/ritual/RitualDailyInterface";
import { useUserRecipesList } from "../../api/hooks/useUserRecipesList";
import { RecipeV2SummaryDTO } from "../../api/interfaces/v2/RecipeV2";
import { lightHaptic } from "../../haptics/light";
import { localIsoDate } from "../../utils/dateUtils";
import Modal from "../modals/Modal";
import MealSection, { MealLocalState } from "./MealSection";
import RecipePicker from "./RecipePicker";

const MEAL_TYPES: MealType[] = ["LUNCH", "DINNER"];
const SWIPE_THRESHOLD_PERCENT = 0.2;
const SWIPE_THRESHOLD_MAX_PX = 100;
const SWIPE_ACTIVATION_ZONE_PERCENT = 0.15;
const FULL_DAY_LABELS = [
    "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche",
];
const FRENCH_MONTHS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const MEAL_LABELS_LONG: Record<MealType, string> = {
    LUNCH: "midi",
    DINNER: "soir",
    UNSPECIFIED: "",
};

function addDays(d: Date, n: number): Date {
    const out = new Date(d);
    out.setDate(out.getDate() + n);
    return out;
}

function parseLocalDate(iso: string): Date {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function entryToState(
    entry: RitualMealPlanEntryInterface | null,
): MealLocalState {
    if (!entry) return { text: "", isSkipped: false, selectedRecipeUuid: null };
    return {
        text: entry.customText ?? "",
        isSkipped: entry.isSkipped,
        selectedRecipeUuid: entry.recipeUuid ?? null,
    };
}

function statesEqual(a: MealLocalState, b: MealLocalState): boolean {
    return (
        a.text === b.text &&
        a.isSkipped === b.isSkipped &&
        a.selectedRecipeUuid === b.selectedRecipeUuid
    );
}

function initStates(
    date: string,
    entriesByKey: Map<string, RitualMealPlanEntryInterface>,
): Record<MealType, MealLocalState> {
    return Object.fromEntries(
        MEAL_TYPES.map((mt) => [
            mt,
            entryToState(entriesByKey.get(`${date}-${mt}`) ?? null),
        ]),
    ) as Record<MealType, MealLocalState>;
}

interface DayDetailModalProps {
    date: string;
    blockStart: Date;
    blockEnd: Date;
    entriesByKey: Map<string, RitualMealPlanEntryInterface>;
    ritualAssignmentsByKey: Map<string, RitualDailyInterface>;
    onClose: () => void;
    onNavigate: (newDate: string) => void;
    onUpsert: (
        date: string,
        mealType: MealType,
        payload: { customText?: string; isSkipped?: boolean; recipeUuid?: string },
    ) => Promise<void>;
    onDelete: (date: string, mealType: MealType) => Promise<void>;
}

export default function DayDetailModal({
    date,
    blockStart,
    blockEnd,
    entriesByKey,
    ritualAssignmentsByKey,
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
    const [pickerForMeal, setPickerForMeal] = useState<MealType | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const carouselRef = useRef<HTMLDivElement>(null);
    const statesRef = useRef(states);
    statesRef.current = states;
    const dateRef = useRef(date);
    dateRef.current = date;
    const entriesByKeyRef = useRef(entriesByKey);
    entriesByKeyRef.current = entriesByKey;
    const dragStartXRef = useRef<number | null>(null);

    const { recipes } = useUserRecipesList();
    const recipesByUuid = useMemo(() => {
        const map = new Map<string, RecipeV2SummaryDTO>();
        recipes.forEach((r) => map.set(r.uuid, r));
        return map;
    }, [recipes]);

    useLayoutEffect(() => {
        if (carouselRef.current) {
            setContainerWidth(carouselRef.current.offsetWidth);
        }
    }, []);

    useEffect(() => {
        setStates(initStates(date, entriesByKey));
        setPickerForMeal(null);
        setDragOffset(0);
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
            if (state.isSkipped) {
                void onUpsert(currentDate, mt, { isSkipped: true });
            } else if (state.selectedRecipeUuid) {
                void onUpsert(currentDate, mt, {
                    recipeUuid: state.selectedRecipeUuid,
                    isSkipped: false,
                });
            } else if (trimmed.length > 0) {
                void onUpsert(currentDate, mt, {
                    customText: trimmed,
                    isSkipped: false,
                });
            } else if (original) {
                void onDelete(currentDate, mt);
            }
        }
    }, [onUpsert, onDelete]);

    const handleClose = () => {
        persistCurrent();
        onClose();
    };

    const handleNavigate = (newDate: string) => {
        if (pickerForMeal) return;
        lightHaptic();
        persistCurrent();
        onNavigate(newDate);
    };

    const setMealState = (mt: MealType, updater: (s: MealLocalState) => MealLocalState) => {
        setStates((s) => ({ ...s, [mt]: updater(s[mt]) }));
    };

    const openPicker = (mt: MealType) => {
        setPickerForMeal(mt);
    };

    const closePicker = () => {
        setPickerForMeal(null);
    };

    const handlePickerConfirm = (uuid: string | null) => {
        if (!pickerForMeal) return;
        setMealState(pickerForMeal, (s) => ({
            ...s,
            selectedRecipeUuid: uuid,
            isSkipped: false,
        }));
        closePicker();
    };

    const handlePickerCancel = () => {
        if (!pickerForMeal) return;
        setMealState(pickerForMeal, (s) => ({ ...s, selectedRecipeUuid: null }));
        closePicker();
    };

    const onTouchStart = (e: React.TouchEvent) => {
        if (!pickerForMeal) return;
        const container = carouselRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const touchXInContainer = e.touches[0].clientX - rect.left;
        if (touchXInContainer > rect.width * SWIPE_ACTIVATION_ZONE_PERCENT) return;
        dragStartXRef.current = e.touches[0].clientX;
        setIsDragging(true);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (dragStartXRef.current === null) return;
        const delta = e.touches[0].clientX - dragStartXRef.current;
        if (delta > 0) setDragOffset(Math.min(delta, containerWidth));
    };

    const onTouchEnd = () => {
        if (dragStartXRef.current === null) return;
        setIsDragging(false);
        const width = carouselRef.current?.offsetWidth ?? containerWidth;
        const threshold = Math.min(width * SWIPE_THRESHOLD_PERCENT, SWIPE_THRESHOLD_MAX_PX);
        if (dragOffset > threshold) {
            closePicker();
        }
        setDragOffset(0);
        dragStartXRef.current = null;
    };

    const ritualSuggestionsForDay = useMemo(() => {
        return MEAL_TYPES
            .map((mt) => ritualAssignmentsByKey.get(`${date}-${mt}`))
            .filter((a): a is RitualDailyInterface => !!a);
    }, [date, ritualAssignmentsByKey]);

    const titleNode = (
        <span className="flex items-center gap-2 text-base font-bold text-text-primary">
            <button
                type="button"
                onClick={() => canGoPrev && !pickerForMeal && handleNavigate(prevDate)}
                disabled={!canGoPrev || !!pickerForMeal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary border border-border-color text-text-primary text-sm disabled:opacity-30"
                aria-label="Jour précédent"
            >
                ←
            </button>
            <button
                type="button"
                onClick={() => canGoNext && !pickerForMeal && handleNavigate(nextDate)}
                disabled={!canGoNext || !!pickerForMeal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary border border-border-color text-text-primary text-sm disabled:opacity-30"
                aria-label="Jour suivant"
            >
                →
            </button>
            <span className="ml-1 truncate">{dayName}</span>
        </span>
    );

    const baseTranslate = pickerForMeal ? "-100%" : "0%";
    const carouselTransform = `translateX(calc(${baseTranslate} + ${dragOffset}px))`;
    const pickerHeaderLabel = pickerForMeal
        ? `Qu'as-tu mangé pour le ${MEAL_LABELS_LONG[pickerForMeal]} ?`
        : "";

    return (
        <Modal isOpen onClose={handleClose} title={titleNode} size="fluid" bodyClassName="">
            <div
                ref={carouselRef}
                className="overflow-hidden w-full max-h-[calc(90vh-80px)]"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div
                    className={`flex w-full items-stretch ${isDragging ? "" : "transition-transform duration-[400ms] ease-out"}`}
                    style={{ transform: carouselTransform }}
                >
                    {/* Panel A: meal sections */}
                    <div className="w-full shrink-0 px-4 py-2 space-y-6 overflow-y-auto">
                        {MEAL_TYPES.map((mt) => {
                            const assignment = ritualAssignmentsByKey.get(`${date}-${mt}`) ?? null;
                            const entry = entriesByKey.get(`${date}-${mt}`) ?? null;
                            const state = states[mt];
                            const pickedRecipe = state.selectedRecipeUuid
                                ? recipesByUuid.get(state.selectedRecipeUuid) ?? null
                                : null;
                            return (
                                <MealSection
                                    key={`${date}-${mt}`}
                                    mealType={mt}
                                    state={state}
                                    assignment={assignment}
                                    pickedRecipeFromList={pickedRecipe}
                                    entryRecipeName={entry?.recipeName ?? null}
                                    onChange={(updater) => setMealState(mt, updater)}
                                    onOpenPicker={() => openPicker(mt)}
                                />
                            );
                        })}
                    </div>

                    {/* Panel B: recipe picker */}
                    <div className="w-full shrink-0">
                        {pickerForMeal && (
                            <RecipePicker
                                headerLabel={pickerHeaderLabel}
                                selectedRecipeUuid={states[pickerForMeal].selectedRecipeUuid}
                                ritualSuggestions={ritualSuggestionsForDay}
                                onCancel={handlePickerCancel}
                                onConfirm={handlePickerConfirm}
                                onBack={closePicker}
                            />
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
