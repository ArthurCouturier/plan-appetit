import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import useAuth from "../api/hooks/useAuth";
import BatchCookingService from "../api/services/BatchCookingService";
import { TrackingService } from "../api/tracking/TrackingService";
import { SKAdNetworkService } from "../api/tracking/skadnetwork/SKAdNetworkService";
import { SKAdNetworkConversionValue } from "../api/tracking/skadnetwork/SKAdNetworkConversionValue";
import BatchStep1Framing from "../components/batchcooking/BatchStep1Framing";
import BatchStep2Preferences from "../components/batchcooking/BatchStep2Preferences";
import BatchStep3Loading from "../components/batchcooking/BatchStep3Loading";
import CreditPaywallModal from "../components/popups/CreditPaywallModal";
import type {
    BatchCookingSlot,
    BudgetTarget,
    BatchCookingDraft,
} from "../api/interfaces/batchcooking/BatchCookingInterfaces";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryConfig";

const DRAFT_KEY = "batch_cooking_draft";

function getDefaultName(): string {
    const now = new Date();
    const day = now.getDate();
    const months = [
        "janvier", "fevrier", "mars", "avril", "mai", "juin",
        "juillet", "aout", "septembre", "octobre", "novembre", "decembre",
    ];
    return `Meal prep du ${day} ${months[now.getMonth()]}`;
}

function loadDraft(): BatchCookingDraft | null {
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as BatchCookingDraft;
    } catch {
        return null;
    }
}

function saveDraft(draft: BatchCookingDraft) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export default function BatchCookingMode() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [step, setStep] = useState(1);
    const stepRef = useRef(1);

    const draft = loadDraft();

    // Step 1 state (name always fresh, rest from draft)
    const [name, setName] = useState(getDefaultName());
    const [totalMeals, setTotalMeals] = useState(draft?.totalMeals ?? 4);
    const [peopleCount, setPeopleCount] = useState(draft?.peopleCount ?? 2);
    const [isDetailed, setIsDetailed] = useState(draft?.isDetailed ?? false);
    const [slots, setSlots] = useState<BatchCookingSlot[]>(draft?.slots ?? []);

    // Step 2 state (from draft)
    const [cuisineStyles, setCuisineStyles] = useState<string[]>(draft?.cuisineStyles ?? []);
    const [equipment, setEquipment] = useState<string[]>(draft?.equipment ?? []);
    const [budgetTarget, setBudgetTarget] = useState<BudgetTarget>(draft?.budgetTarget ?? "BALANCED");
    const [excludedIngredients, setExcludedIngredients] = useState<string[]>(draft?.excludedIngredients ?? []);
    const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(draft?.dietaryRestrictions ?? []);

    // Step 3 state
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Back button via history
    const goToStep = useCallback((newStep: number) => {
        setStep(newStep);
        stepRef.current = newStep;
        window.scrollTo(0, 0);
        window.history.pushState({ batchStep: newStep }, "");
    }, []);

    useEffect(() => {
        window.history.replaceState({ batchStep: 1 }, "");

        const handlePopState = (e: PopStateEvent) => {
            const targetStep = e.state?.batchStep;
            if (typeof targetStep === "number" && targetStep >= 1) {
                setStep(targetStep);
                stepRef.current = targetStep;
                window.scrollTo(0, 0);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // Persist all form data to localStorage
    useEffect(() => {
        saveDraft({
            name, totalMeals, peopleCount, isDetailed, slots,
            cuisineStyles, equipment, budgetTarget, excludedIngredients, dietaryRestrictions,
            timestamp: Date.now(),
        });
    }, [name, totalMeals, peopleCount, isDetailed, slots, cuisineStyles, equipment, budgetTarget, excludedIngredients, dietaryRestrictions]);

    const getAuthHeaders = useCallback(() => {
        const email = user?.email ?? localStorage.getItem("email") ?? "";
        const token = user?.token ?? localStorage.getItem("firebaseIdToken") ?? "";
        return { email, token };
    }, [user]);

    const handleGenerate = async () => {
        setError(null);
        setIsGenerating(true);
        goToStep(3);

        TrackingService.logRecipeGenerationInitiated("batch");

        try {
            const { email, token } = getAuthHeaders();

            const result = await BatchCookingService.generate(
                {
                    name,
                    config: {
                        mode: isDetailed ? "DETAILED" : "SIMPLE",
                        totalMeals,
                        defaultPeopleCount: isDetailed ? undefined : peopleCount,
                        slots: isDetailed ? slots : [],
                    },
                    preferences: {
                        cuisineStyles,
                        dietaryRestrictions,
                        budgetTarget,
                        availableEquipment: equipment,
                        excludedIngredients,
                    },
                },
                email,
                token
            );

            queryClient.invalidateQueries({ queryKey: queryKeys.collections.all() });
            queryClient.invalidateQueries({ queryKey: ["batch-cookings-all"] });
            TrackingService.logRecipeGenerated("batch");
            SKAdNetworkService.updateConversionValue(SKAdNetworkConversionValue.ONE_RECIPE_GENERATED);

            navigate(`/batch-cooking/${result.uuid}`);
        } catch (err: unknown) {
            if (err && typeof err === "object" && "type" in err && (err as { type: string }).type === "INSUFFICIENT_CREDITS") {
                SKAdNetworkService.updateConversionValue(SKAdNetworkConversionValue.QUOTA_REACHED);
                setShowPaywall(true);
                setIsGenerating(false);
                setStep(2);
                stepRef.current = 2;
                return;
            }
            setError("Impossible de generer le batch cooking. Reessaie.");
            setIsGenerating(false);
            setStep(2);
            stepRef.current = 2;
        }
    };

    return (
        <>
            <div className="min-h-screen bg-bg-color pb-20" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 4rem)" }}>
                {/* Error banner */}
                {error && (
                    <div className="max-w-md mx-auto mb-4 px-4">
                        <div className="bg-cancel-1/10 border border-cancel-1 text-cancel-1 px-4 py-3 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    </div>
                )}

                {/* Step indicator */}
                <div className="flex justify-center gap-2 mb-6 px-4">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                s === step ? "w-8 bg-cout-base" : s < step ? "w-8 bg-cout-yellow" : "w-8 bg-secondary"
                            }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <BatchStep1Framing
                            key="step1"
                            name={name}
                            totalMeals={totalMeals}
                            peopleCount={peopleCount}
                            isDetailed={isDetailed}
                            slots={slots}
                            onNameChange={setName}
                            onTotalMealsChange={setTotalMeals}
                            onPeopleCountChange={setPeopleCount}
                            onDetailedChange={setIsDetailed}
                            onSlotsChange={setSlots}
                            onNext={() => goToStep(2)}
                        />
                    )}

                    {step === 2 && (
                        <BatchStep2Preferences
                            key="step2"
                            cuisineStyles={cuisineStyles}
                            equipment={equipment}
                            budgetTarget={budgetTarget}
                            excludedIngredients={excludedIngredients}
                            dietaryRestrictions={dietaryRestrictions}
                            onCuisineStylesChange={setCuisineStyles}
                            onEquipmentChange={setEquipment}
                            onBudgetTargetChange={setBudgetTarget}
                            onExcludedIngredientsChange={setExcludedIngredients}
                            onDietaryRestrictionsChange={setDietaryRestrictions}
                            onNext={handleGenerate}
                            onBack={() => goToStep(1)}
                        />
                    )}

                    {step === 3 && (
                        <BatchStep3Loading key="step3" isLoading={isGenerating} />
                    )}
                </AnimatePresence>
            </div>

            {showPaywall && <CreditPaywallModal onClose={() => setShowPaywall(false)} />}
        </>
    );
}
