import { useEffect, useRef, useState } from "react";
import { BookOpenIcon } from "@heroicons/react/24/solid";
import { RitualDailyInterface, MealType } from "../../api/interfaces/ritual/RitualDailyInterface";
import RecipeCard from "../cards/RecipeCard";
import { ritualDailyToRecipeSummary } from "../../api/adapters/ritualDailyAdapter";
import { lightHaptic } from "../../haptics/light";
import { RecipeV2SummaryDTO } from "../../api/interfaces/v2/RecipeV2";

export interface MealLocalState {
    text: string;
    isSkipped: boolean;
    selectedRecipeUuid: string | null;
}

const CUSTOM_TEXT_MAX_LENGTH = 250;
const LENGTH_ERROR_DURATION_MS = 5000;

const MEAL_LABELS: Record<MealType, string> = {
    LUNCH: "Midi",
    DINNER: "Soir",
    UNSPECIFIED: "",
};

interface MealSectionProps {
    mealType: MealType;
    state: MealLocalState;
    assignment: RitualDailyInterface | null;
    pickedRecipeFromList: RecipeV2SummaryDTO | null;
    entryRecipeName: string | null;
    onChange: (updater: (s: MealLocalState) => MealLocalState) => void;
    onOpenPicker: () => void;
}

export default function MealSection({
    mealType,
    state,
    assignment,
    pickedRecipeFromList,
    entryRecipeName,
    onChange,
    onOpenPicker,
}: MealSectionProps) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [showLengthError, setShowLengthError] = useState(false);
    const errorTimerRef = useRef<number | null>(null);

    const isAtMax = state.text.length >= CUSTOM_TEXT_MAX_LENGTH;
    const selectedRecipe = state.selectedRecipeUuid
        ? resolveSelectedRecipe(
              state.selectedRecipeUuid,
              assignment,
              pickedRecipeFromList,
              entryRecipeName,
          )
        : null;
    const hasSelection = !!state.selectedRecipeUuid;

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
        onChange((s) => ({
            ...s,
            isSkipped: !s.isSkipped,
            selectedRecipeUuid: s.isSkipped ? s.selectedRecipeUuid : null,
        }));
        lightHaptic();
    };

    const clearSelection = () => {
        onChange((s) => ({ ...s, selectedRecipeUuid: null }));
        lightHaptic();
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2 gap-2">
                <span className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                    {MEAL_LABELS[mealType]}
                </span>
                <PillToggle label="Sauté" value={state.isSkipped} onChange={toggleSkip} />
            </div>

            {state.isSkipped ? (
                <div className="overflow-hidden transition-all duration-200 ease-out max-h-16 opacity-100">
                    <p className="text-text-secondary italic text-sm py-3">🚫 Repas sauté</p>
                </div>
            ) : hasSelection && selectedRecipe ? (
                <div>
                    <div className="mx-auto max-w-[220px]">
                        <RecipeCard key={String(selectedRecipe.uuid)} recipe={selectedRecipe} />
                    </div>
                    <div className="flex gap-2 mt-2">
                        <button
                            type="button"
                            onClick={onOpenPicker}
                            className="flex-1 px-3 py-2 rounded-full bg-secondary border border-border-color text-text-primary text-sm font-semibold"
                        >
                            Changer la recette
                        </button>
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="px-3 py-2 rounded-full bg-secondary border border-border-color text-text-secondary text-sm"
                            aria-label="Désélectionner"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ) : (
                <div>
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
                    <button
                        type="button"
                        onClick={onOpenPicker}
                        className="mt-2 w-fit mx-auto flex items-center gap-2 px-4 py-2 rounded-full bg-cout-purple text-white text-sm font-semibold"
                    >
                        <BookOpenIcon className="w-4 h-4" />
                        Choisir une recette
                    </button>
                </div>
            )}
        </div>
    );
}

function resolveSelectedRecipe(
    uuid: string,
    assignment: RitualDailyInterface | null,
    pickedFromList: RecipeV2SummaryDTO | null,
    fallbackName: string | null,
) {
    if (assignment && assignment.recipeUuid === uuid) {
        return ritualDailyToRecipeSummary(assignment);
    }
    if (pickedFromList && pickedFromList.uuid === uuid) {
        return {
            uuid: pickedFromList.uuid,
            name: pickedFromList.name,
            covers: pickedFromList.covers,
            buyPrice: 0,
            isPublic: false,
            displayOrder: 0,
            totalTimeMin: pickedFromList.totalTimeMin,
            restTimeMin: null,
            creationDate: null,
        };
    }
    if (fallbackName) {
        return {
            uuid,
            name: fallbackName,
            covers: 0,
            buyPrice: 0,
            isPublic: false,
            displayOrder: 0,
            totalTimeMin: null,
            restTimeMin: null,
            creationDate: null,
        };
    }
    return null;
}

function PillToggle({
    label,
    value,
    onChange,
}: {
    label: string;
    value: boolean;
    onChange: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onChange}
            className="flex items-center gap-2 shrink-0"
            aria-label={label}
        >
            <span className="text-xs text-text-secondary">{label}</span>
            <span
                className={`w-10 h-6 rounded-full p-0.5 transition-colors ${
                    value ? "bg-cout-yellow" : "bg-border-color"
                }`}
            >
                <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        value ? "translate-x-4" : "translate-x-0"
                    }`}
                />
            </span>
        </button>
    );
}
