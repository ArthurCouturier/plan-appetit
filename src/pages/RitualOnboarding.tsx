import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    useCompleteCulinaryOnboarding,
    useCulinaryProfile,
    useUpdateCulinaryProfile,
} from "../api/hooks/useCulinaryProfile";
import type { UpdateUserCulinaryProfileRequest } from "../api/interfaces/users/UserCulinaryProfileInterface";
import { lightHaptic } from "../haptics/light";
import { mediumHaptic } from "../haptics/medium";
import { errorHaptic } from "../haptics/error";
import {
    Q1Household,
    Q2Restrictions,
    Q3Budget,
    Q4CookingLevel,
    Q5TimeLunch,
    Q6TimeDinner,
    Q7AmbitiousMeals,
    Q8Equipment,
    Q9Flavors,
} from "../components/ritual/onboarding/editors";
import {
    budgetLabel,
    cookingLevelLabel,
    formatAmbitiousMeals,
    formatList,
} from "../components/ritual/onboarding/labels";
import {
    DEFAULT_DRAFT,
    Draft,
    profileToDraft,
} from "../components/ritual/onboarding/types";
import { TOTAL_QUESTIONS } from "../components/ritual/onboarding/constants";

const STORAGE_KEY = "ritualOnboardingDraft";

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
        <div className="min-h-screen flex flex-col bg-bg-color mobile-content-with-header">
            <div className="px-4 pb-2">
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
                    className="fixed bottom-0 left-0 right-0 bg-bg-color px-4 pt-3"
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
    return (
        <div className="max-w-md mx-auto w-full">
            <div className="flex justify-between text-xs text-text-secondary mb-1.5">
                <span>Question {current}</span>
                <span>{current}/{total}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                    className="h-full bg-cout-yellow transition-all"
                    style={{ width: `${(current / total) * 100}%` }}
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
