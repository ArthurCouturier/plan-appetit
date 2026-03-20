import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import useAuth from "../api/hooks/useAuth";
import FridgeService from "../api/services/FridgeService";
import { TrackingService } from "../api/tracking/TrackingService";
import FridgeStep1Ingredients from "../components/fridge/FridgeStep1Ingredients";
import FridgeStep2Context from "../components/fridge/FridgeStep2Context";
import FridgeStep3Questions from "../components/fridge/FridgeStep3Questions";
import FridgeStep4Shopping from "../components/fridge/FridgeStep4Shopping";
import FridgeStep5RecipeChoice from "../components/fridge/FridgeStep5RecipeChoice";
import RecipeGenerationLoadingModal from "../components/popups/RecipeGenerationLoadingModal";
import CreditPaywallModal from "../components/popups/CreditPaywallModal";
import type {
    TimeCategory,
    FridgeQuestion,
    FridgeQuestionContext,
    FridgeShoppingResponse,
    FridgeDraft,
} from "../api/interfaces/fridge/FridgeInterfaces";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryConfig";

const DRAFT_KEY = "fridge_mode_draft";

function loadDraft(): FridgeDraft | null {
    try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as FridgeDraft;
    } catch {
        return null;
    }
}

function saveDraft(draft: FridgeDraft) {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export default function FridgeMode() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Flow state
    const [step, setStep] = useState(1);
    const stepRef = useRef(1);

    // Step 1 & 2 state (cached)
    const draft = loadDraft();
    const [ingredients, setIngredients] = useState(draft?.ingredients ?? "");
    const [servings, setServings] = useState(draft?.servings ?? 2);
    const [timeCategory, setTimeCategory] = useState<TimeCategory>(draft?.timeCategory ?? "normal");

    // Step 3 state
    const [questions, setQuestions] = useState<FridgeQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, unknown>>({});

    // Step 4 state
    const [shoppingData, setShoppingData] = useState<FridgeShoppingResponse | null>(null);

    // Step 5 state
    const [availableRecipes, setAvailableRecipes] = useState<string[]>([]);
    const [shoppingAcceptedForStep5, setShoppingAcceptedForStep5] = useState(false);
    const [shoppingItemsForStep5, setShoppingItemsForStep5] = useState<string[]>([]);

    // Loading & error states
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [isLoadingShopping, setIsLoadingShopping] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Back button via history — step 1 goes to previous page, other steps go back one step
    const goToStep = useCallback((newStep: number) => {
        setStep(newStep);
        stepRef.current = newStep;
        window.scrollTo(0, 0);
        window.history.pushState({ fridgeStep: newStep }, "");
    }, []);

    useEffect(() => {
        // Push initial state for step 1
        window.history.replaceState({ fridgeStep: 1 }, "");

        const handlePopState = (e: PopStateEvent) => {
            const targetStep = e.state?.fridgeStep;
            if (typeof targetStep === "number" && targetStep >= 1) {
                setStep(targetStep);
                stepRef.current = targetStep;
                window.scrollTo(0, 0);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    // Save draft on step 1 & 2 changes
    useEffect(() => {
        saveDraft({ ingredients, servings, timeCategory, timestamp: Date.now() });
    }, [ingredients, servings, timeCategory]);

    const getAuthHeaders = useCallback(() => {
        const email = user?.email ?? localStorage.getItem("email") ?? "";
        const token = user?.token ?? localStorage.getItem("firebaseIdToken") ?? "";
        return { email, token };
    }, [user]);

    // Initialize default answers when questions arrive
    useEffect(() => {
        if (questions.length > 0) {
            const defaults: Record<string, unknown> = {};
            questions.forEach((q) => {
                switch (q.type) {
                    case "slider":
                        defaults[q.id] = q.min ?? 0;
                        break;
                    case "level":
                        defaults[q.id] = q.options?.[0] ?? "Non";
                        break;
                    case "boolean":
                        defaults[q.id] = false;
                        break;
                    case "choice":
                        defaults[q.id] = q.options?.[0] ?? "";
                        break;
                }
            });
            setAnswers(defaults);
        }
    }, [questions]);

    const handleStep2Next = async () => {
        setError(null);
        setIsLoadingQuestions(true);
        goToStep(3);

        try {
            const { email, token } = getAuthHeaders();
            const response = await FridgeService.generateQuestions(
                { ingredients, servings, timeCategory },
                email,
                token
            );
            setQuestions(response.questions);
        } catch {
            setError("Impossible de générer les questions. Réessaie.");
            setStep(2);
            stepRef.current = 2;
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const buildQuestionsContext = useCallback((): FridgeQuestionContext[] => {
        return questions.map((q) => ({ id: q.id, label: q.label, emoji: q.emoji }));
    }, [questions]);

    const handleStep3Next = async () => {
        TrackingService.logFridgeFinishedStep3();
        setError(null);
        setIsLoadingShopping(true);
        goToStep(4);

        try {
            const { email, token } = getAuthHeaders();
            const response = await FridgeService.analyzeShopping(
                { ingredients, servings, timeCategory, answers, questions: buildQuestionsContext() },
                email,
                token
            );

            if (!response.shoppingNeeded) {
                setAvailableRecipes(response.recipesWithoutShopping ?? []);
                setShoppingAcceptedForStep5(false);
                setShoppingItemsForStep5([]);
                setIsLoadingShopping(false);
                goToStep(5);
            } else {
                setShoppingData(response);
                setIsLoadingShopping(false);
            }
        } catch {
            setError("Impossible d'analyser les courses. Réessaie.");
            setStep(3);
            stepRef.current = 3;
            setIsLoadingShopping(false);
        }
    };

    const generateFinalRecipe = async (shoppingAccepted: boolean, shoppingItems: string[], selectedRecipeTitle: string) => {
        setError(null);
        setIsGenerating(true);
        TrackingService.logRecipeGenerationInitiated('fridge');

        try {
            const { email, token } = getAuthHeaders();
            const recipe = await FridgeService.generateRecipe(
                {
                    ingredients,
                    servings,
                    timeCategory,
                    answers,
                    questions: buildQuestionsContext(),
                    shoppingAccepted,
                    shoppingItems,
                    selectedRecipeTitle,
                },
                email,
                token
            );

            queryClient.invalidateQueries({ queryKey: queryKeys.collections.all() });

            TrackingService.logRecipeGenerated('fridge');
            navigate(`/recettes/${recipe.uuid}`);
        } catch (err: unknown) {
            if (err && typeof err === "object" && "type" in err && (err as { type: string }).type === "INSUFFICIENT_CREDITS") {
                setShowPaywall(true);
                setIsGenerating(false);
                return;
            }
            setError("Impossible de générer la recette. Réessaie.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAcceptShopping = () => {
        const items = shoppingData?.items.map((i) => i.name) ?? [];
        const recipes = [
            ...(shoppingData?.recipesWithoutShopping ?? []),
            ...(shoppingData?.recipesWithShopping ?? []),
        ];
        setAvailableRecipes(recipes);
        setShoppingAcceptedForStep5(true);
        setShoppingItemsForStep5(items);
        goToStep(5);
    };

    const handleDeclineShopping = () => {
        setAvailableRecipes(shoppingData?.recipesWithoutShopping ?? []);
        setShoppingAcceptedForStep5(false);
        setShoppingItemsForStep5([]);
        goToStep(5);
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
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-300 ${s === step ? "w-8 bg-cout-base" : s < step ? "w-8 bg-cout-yellow" : "w-8 bg-secondary"
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <FridgeStep1Ingredients
                            key="step1"
                            value={ingredients}
                            onChange={setIngredients}
                            onNext={() => goToStep(2)}
                        />
                    )}

                    {step === 2 && (
                        <FridgeStep2Context
                            key="step2"
                            servings={servings}
                            timeCategory={timeCategory}
                            onServingsChange={setServings}
                            onTimeCategoryChange={setTimeCategory}
                            onNext={handleStep2Next}
                            onBack={() => goToStep(1)}
                        />
                    )}

                    {step === 3 && (
                        <>
                            {isLoadingQuestions ? (
                                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                                    <div className="relative w-20 h-20 mb-4">
                                        <div className="absolute inset-0 border-4 border-cout-yellow/30 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-transparent border-t-cout-yellow rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl">🔍</span>
                                        </div>
                                    </div>
                                    <p className="text-text-secondary">On fouille dans nos grimoires...</p>
                                </div>
                            ) : (
                                <FridgeStep3Questions
                                    key="step3"
                                    questions={questions}
                                    answers={answers}
                                    onAnswerChange={(id, value) =>
                                        setAnswers((prev) => ({ ...prev, [id]: value }))
                                    }
                                    onNext={handleStep3Next}
                                    onBack={() => goToStep(2)}
                                />
                            )}
                        </>
                    )}

                    {step === 4 && (
                        <>
                            {isLoadingShopping ? (
                                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                                    <div className="relative w-20 h-20 mb-4">
                                        <div className="absolute inset-0 border-4 border-cout-yellow/30 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-transparent border-t-cout-yellow rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-2xl">🛒</span>
                                        </div>
                                    </div>
                                    <p className="text-text-secondary text-center px-8">On vérifie qu'on a tout et on trouve des bonnes idées...</p>
                                </div>
                            ) : shoppingData ? (
                                <FridgeStep4Shopping
                                    key="step4"
                                    shoppingData={shoppingData}
                                    onAcceptShopping={handleAcceptShopping}
                                    onDeclineShopping={handleDeclineShopping}
                                />
                            ) : null}
                        </>
                    )}

                    {step === 5 && (
                        <FridgeStep5RecipeChoice
                            key="step5"
                            recipes={availableRecipes}
                            onSelect={(title) => generateFinalRecipe(shoppingAcceptedForStep5, shoppingItemsForStep5, title)}
                        />
                    )}
                </AnimatePresence>
            </div>

            <RecipeGenerationLoadingModal isOpen={isGenerating} />

            {showPaywall && <CreditPaywallModal onClose={() => setShowPaywall(false)} />}
        </>
    );
}
