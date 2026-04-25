import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import useAuth from "../api/hooks/useAuth";
import GuidedSandboxService from "../api/services/GuidedSandboxService";
import type {
    GuidedSandboxDraft,
    GuidedSandboxQuestion,
    GuidedSandboxStepResponse,
    GuidedSandboxTurn,
} from "../api/interfaces/guided-sandbox/GuidedSandboxTypes";
import SeedInput from "../components/guided-sandbox/SeedInput";
import GuidedStepView from "../components/guided-sandbox/GuidedStepView";
import SurpriseConfirmModal from "../components/guided-sandbox/SurpriseConfirmModal";
import ResumeDraftModal from "../components/guided-sandbox/ResumeDraftModal";
import RecipeGenerationLoadingModal from "../components/modals/RecipeGenerationLoadingModal";

const DRAFT_KEY = "GuidedSandboxDraft";
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const TOTAL_TURNS = 5;

type PageStep = "seed" | "question" | "generating";

interface StepEndpointCall {
    (
        request: {
            seed: string;
            turns: GuidedSandboxTurn[];
            surpriseMe: boolean;
            sourceRecipeUuid?: string | null;
        },
        email: string,
        token: string
    ): Promise<GuidedSandboxStepResponse>;
}

function loadDraft(): GuidedSandboxDraft | null {
    try {
        const raw = sessionStorage.getItem(DRAFT_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as GuidedSandboxDraft;
        if (!parsed.timestamp || Date.now() - parsed.timestamp > DRAFT_MAX_AGE_MS) {
            return null;
        }
        if (!parsed.seed || parsed.seed.trim().length === 0) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
}

function saveDraft(draft: GuidedSandboxDraft) {
    try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
        // ignore quota errors
    }
}

function clearDraft() {
    try {
        sessionStorage.removeItem(DRAFT_KEY);
    } catch {
        // ignore
    }
}

export default function GuidedSandbox() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const remixParam = searchParams.get("remix");
    const sourceRecipeUuid = remixParam && remixParam.length > 0 ? remixParam : null;

    const [pageStep, setPageStep] = useState<PageStep>("seed");
    const [seed, setSeed] = useState<string>("");
    const [surpriseMe, setSurpriseMe] = useState<boolean>(false);
    const [turns, setTurns] = useState<GuidedSandboxTurn[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<GuidedSandboxQuestion | null>(null);
    const [isStepLoading, setIsStepLoading] = useState<boolean>(false);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [seedError, setSeedError] = useState<string | null>(null);
    const [stepError, setStepError] = useState<string | null>(null);
    const [showSurpriseConfirm, setShowSurpriseConfirm] = useState<boolean>(false);
    const [showResumeModal, setShowResumeModal] = useState<boolean>(false);
    const [remixRecipeName, setRemixRecipeName] = useState<string | null>(null);

    const stashedDraft = useRef<GuidedSandboxDraft | null>(null);
    const mountedRef = useRef<boolean>(false);

    const getAuthHeaders = useCallback(() => {
        const email = user?.email ?? localStorage.getItem("email") ?? "";
        const token = user?.token ?? localStorage.getItem("firebaseIdToken") ?? "";
        return { email, token };
    }, [user]);

    // Mount: check for resumable draft + fetch remix recipe name
    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;

        const draft = loadDraft();
        if (draft) {
            stashedDraft.current = draft;
            setShowResumeModal(true);
        }
    }, []);

    useEffect(() => {
        if (!sourceRecipeUuid) {
            setRemixRecipeName(null);
            return;
        }
        const { email, token } = getAuthHeaders();
        if (!email || !token) {
            setRemixRecipeName(null);
            return;
        }
        let cancelled = false;
        GuidedSandboxService.fetchRecipeV2Summary(sourceRecipeUuid, email, token)
            .then((summary) => {
                if (!cancelled) setRemixRecipeName(summary.name);
            })
            .catch(() => {
                if (!cancelled) setRemixRecipeName(null);
            });
        return () => {
            cancelled = true;
        };
    }, [sourceRecipeUuid, getAuthHeaders]);

    // Persist draft whenever state changes after user actually started flow
    useEffect(() => {
        if (pageStep === "seed" && turns.length === 0 && seed.trim().length === 0) {
            return;
        }
        const draft: GuidedSandboxDraft = {
            seed,
            surpriseMe,
            sourceRecipeUuid,
            turns,
            timestamp: Date.now(),
        };
        saveDraft(draft);
    }, [seed, surpriseMe, sourceRecipeUuid, turns, pageStep]);

    const callStepEndpoint = useCallback(
        async (
            endpoint: StepEndpointCall,
            nextTurns: GuidedSandboxTurn[],
            surprise: boolean
        ): Promise<GuidedSandboxStepResponse> => {
            const { email, token } = getAuthHeaders();
            return endpoint(
                {
                    seed,
                    turns: nextTurns,
                    surpriseMe: surprise,
                    sourceRecipeUuid,
                },
                email,
                token
            );
        },
        [getAuthHeaders, seed, sourceRecipeUuid]
    );

    const handleGenerate = useCallback(
        async (finalTurns: GuidedSandboxTurn[], surprise: boolean) => {
            setIsGenerating(true);
            setPageStep("generating");
            setStepError(null);
            setSeedError(null);
            try {
                const { email, token } = getAuthHeaders();
                const result = await GuidedSandboxService.generate(
                    {
                        seed,
                        turns: finalTurns,
                        surpriseMe: surprise,
                        sourceRecipeUuid,
                    },
                    email,
                    token
                );
                clearDraft();
                navigate(`/recipes-v2/${result.recipeUuid}`);
            } catch {
                setIsGenerating(false);
                setPageStep(finalTurns.length === 0 ? "seed" : "question");
                const message = "La génération a échoué. Réessaie.";
                if (finalTurns.length === 0) {
                    setSeedError(message);
                } else {
                    setStepError(message);
                }
            }
        },
        [getAuthHeaders, navigate, seed, sourceRecipeUuid]
    );

    const stepEndpointForTurnCount = useCallback(
        (turnCount: number): StepEndpointCall => {
            if (turnCount === 0) {
                return (req, email, token) =>
                    GuidedSandboxService.step1(
                        {
                            seed: req.seed,
                            surpriseMe: req.surpriseMe,
                            sourceRecipeUuid: req.sourceRecipeUuid,
                        },
                        email,
                        token
                    );
            }
            switch (turnCount) {
                case 1:
                    return GuidedSandboxService.step2.bind(GuidedSandboxService);
                case 2:
                    return GuidedSandboxService.step3.bind(GuidedSandboxService);
                case 3:
                    return GuidedSandboxService.step4.bind(GuidedSandboxService);
                default:
                    return GuidedSandboxService.step5.bind(GuidedSandboxService);
            }
        },
        []
    );

    const applyStepResponse = useCallback(
        (response: GuidedSandboxStepResponse, nextTurns: GuidedSandboxTurn[], surprise: boolean) => {
            if (response.ready) {
                void handleGenerate(nextTurns, surprise);
                return;
            }
            if (!response.nextQuestion) {
                void handleGenerate(nextTurns, surprise);
                return;
            }
            setCurrentQuestion(response.nextQuestion);
            setPageStep("question");
        },
        [handleGenerate]
    );

    const handleSeedSubmit = useCallback(async () => {
        const trimmed = seed.trim();
        if (trimmed.length < 3) {
            setSeedError("Décris ton envie en au moins 3 caractères.");
            return;
        }
        setSeedError(null);
        setSurpriseMe(false);
        setIsStepLoading(true);
        setPageStep("question");
        try {
            const response = await callStepEndpoint(stepEndpointForTurnCount(0), [], false);
            applyStepResponse(response, [], false);
        } catch {
            setPageStep("seed");
            setSeedError("Impossible de démarrer la génération. Réessaie.");
        } finally {
            setIsStepLoading(false);
        }
    }, [seed, callStepEndpoint, stepEndpointForTurnCount, applyStepResponse]);

    const handleSurpriseRequest = useCallback(() => {
        setShowSurpriseConfirm(true);
    }, []);

    const handleSurpriseConfirm = useCallback(async () => {
        setShowSurpriseConfirm(false);
        setSurpriseMe(true);
        setTurns([]);
        await handleGenerate([], true);
    }, [handleGenerate]);

    const handleQuestionSubmit = useCallback(
        async (choice: string) => {
            if (!currentQuestion) return;
            const newTurn: GuidedSandboxTurn = {
                questionId: currentQuestion.id,
                choice,
            };
            const nextTurns = [...turns, newTurn];
            setTurns(nextTurns);
            setStepError(null);
            setCurrentQuestion(null);
            setIsStepLoading(true);

            if (nextTurns.length >= TOTAL_TURNS) {
                await handleGenerate(nextTurns, surpriseMe);
                setIsStepLoading(false);
                return;
            }

            try {
                const response = await callStepEndpoint(
                    stepEndpointForTurnCount(nextTurns.length),
                    nextTurns,
                    surpriseMe
                );
                applyStepResponse(response, nextTurns, surpriseMe);
            } catch {
                setStepError("Impossible de charger la suite. Réessaie.");
                // Keep turn so user can retry without losing context
            } finally {
                setIsStepLoading(false);
            }
        },
        [
            currentQuestion,
            turns,
            surpriseMe,
            callStepEndpoint,
            stepEndpointForTurnCount,
            applyStepResponse,
            handleGenerate,
        ]
    );

    const handleQuestionRetry = useCallback(async () => {
        setStepError(null);
        setIsStepLoading(true);
        try {
            const response = await callStepEndpoint(
                stepEndpointForTurnCount(turns.length),
                turns,
                surpriseMe
            );
            applyStepResponse(response, turns, surpriseMe);
        } catch {
            setStepError("Toujours impossible de continuer. Réessaie encore.");
        } finally {
            setIsStepLoading(false);
        }
    }, [callStepEndpoint, stepEndpointForTurnCount, turns, surpriseMe, applyStepResponse]);

    const handleBack = useCallback(async () => {
        setStepError(null);
        if (turns.length === 0) {
            setPageStep("seed");
            setCurrentQuestion(null);
            return;
        }
        const previousTurns = turns.slice(0, -1);
        setTurns(previousTurns);
        setCurrentQuestion(null);
        setIsStepLoading(true);
        try {
            const response = await callStepEndpoint(
                stepEndpointForTurnCount(previousTurns.length),
                previousTurns,
                surpriseMe
            );
            if (response.ready || !response.nextQuestion) {
                setPageStep("seed");
                setStepError("Impossible de revenir à cette étape.");
                return;
            }
            setCurrentQuestion(response.nextQuestion);
            setPageStep("question");
        } catch {
            setStepError("Impossible de revenir en arrière. Réessaie.");
        } finally {
            setIsStepLoading(false);
        }
    }, [turns, callStepEndpoint, stepEndpointForTurnCount, surpriseMe]);

    const handleResumeDraft = useCallback(async () => {
        const draft = stashedDraft.current;
        setShowResumeModal(false);
        if (!draft) return;
        setSeed(draft.seed);
        setSurpriseMe(draft.surpriseMe);
        setTurns(draft.turns);
        setStepError(null);
        setSeedError(null);

        if (draft.turns.length >= TOTAL_TURNS) {
            await handleGenerate(draft.turns, draft.surpriseMe);
            return;
        }

        setPageStep("question");
        setIsStepLoading(true);
        try {
            const response = await callStepEndpoint(
                stepEndpointForTurnCount(draft.turns.length),
                draft.turns,
                draft.surpriseMe
            );
            applyStepResponse(response, draft.turns, draft.surpriseMe);
        } catch {
            setPageStep("seed");
            setSeedError("Impossible de reprendre la session. Réessaie.");
        } finally {
            setIsStepLoading(false);
        }
    }, [
        callStepEndpoint,
        stepEndpointForTurnCount,
        applyStepResponse,
        handleGenerate,
    ]);

    const handleDiscardDraft = useCallback(() => {
        stashedDraft.current = null;
        clearDraft();
        setShowResumeModal(false);
    }, []);

    const previousChoiceForCurrentTurn = useMemo(() => {
        if (!currentQuestion) return undefined;
        const existing = turns.find((t) => t.questionId === currentQuestion.id);
        return existing?.choice;
    }, [currentQuestion, turns]);

    const progressIndicator = useMemo(() => {
        if (pageStep === "seed") return null;
        const totalShown = turns.length + 1;
        return (
            <div className="flex justify-center gap-2 mb-4 px-4">
                {Array.from({ length: totalShown }).map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 w-8 ${idx < turns.length ? "bg-cout-yellow" : "bg-cout-base"
                            }`}
                    />
                ))}
            </div>
        );
    }, [pageStep, turns.length]);

    const remixBanner = useMemo(() => {
        if (!sourceRecipeUuid) return null;
        const label = remixRecipeName ?? sourceRecipeUuid;
        return (
            <div className="max-w-md mx-auto mb-4 px-4">
                <div className="bg-cout-base/10 border border-cout-base/30 text-text-primary text-sm rounded-xl px-4 py-3">
                    Tu retravailles : <span className="font-semibold text-cout-base">{label}</span>
                </div>
            </div>
        );
    }, [sourceRecipeUuid, remixRecipeName]);

    return (
        <>
            <div
                className="min-h-screen bg-bg-color pb-20"
                style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 4rem)" }}
            >
                {remixBanner}
                {progressIndicator}

                <AnimatePresence mode="wait">
                    {pageStep === "seed" && (
                        <motion.div key="seed" className="w-full">
                            <SeedInput
                                seed={seed}
                                onSeedChange={setSeed}
                                onSubmit={handleSeedSubmit}
                                onSurprise={handleSurpriseRequest}
                                disabled={isStepLoading || isGenerating}
                                error={seedError}
                                onRetry={seedError ? handleSeedSubmit : undefined}
                            />
                        </motion.div>
                    )}

                    {pageStep === "question" && (
                        <motion.div key={`turn-${turns.length}`} className="w-full">
                            {currentQuestion ? (
                                <GuidedStepView
                                    question={currentQuestion}
                                    turnIndex={turns.length}
                                    totalTurns={TOTAL_TURNS}
                                    initialChoice={previousChoiceForCurrentTurn}
                                    onSubmit={handleQuestionSubmit}
                                    onBack={handleBack}
                                    loading={false}
                                    error={stepError}
                                    onRetry={stepError ? handleQuestionRetry : undefined}
                                />
                            ) : (
                                <GuidedStepViewSkeleton
                                    onBack={handleBack}
                                    error={stepError}
                                    onRetry={stepError ? handleQuestionRetry : undefined}
                                    loading={isStepLoading}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <SurpriseConfirmModal
                isOpen={showSurpriseConfirm}
                onConfirm={handleSurpriseConfirm}
                onCancel={() => setShowSurpriseConfirm(false)}
            />

            <ResumeDraftModal
                isOpen={showResumeModal}
                seedPreview={stashedDraft.current?.seed ?? ""}
                onResume={handleResumeDraft}
                onDiscard={handleDiscardDraft}
            />

            <RecipeGenerationLoadingModal isOpen={isGenerating} />
        </>
    );
}

interface GuidedStepViewSkeletonProps {
    onBack: () => void;
    error: string | null;
    onRetry?: () => void;
    loading: boolean;
}

function GuidedStepViewSkeleton({
    onBack,
    error,
    onRetry,
    loading,
}: GuidedStepViewSkeletonProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center px-4 pb-8 w-full"
        >
            <div className="w-full max-w-md">
                <div className={`bg-primary border border-border-color rounded-2xl p-6 shadow-md ${loading ? "animate-pulse" : ""}`}>
                    <div className="h-6 bg-secondary rounded w-3/4 mb-6"></div>
                    <div className="space-y-3">
                        <div className="h-12 bg-secondary rounded-xl"></div>
                        <div className="h-12 bg-secondary rounded-xl"></div>
                        <div className="h-12 bg-secondary rounded-xl"></div>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 bg-cancel-1/10 border border-cancel-1 text-cancel-1 px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-3">
                        <span>{error}</span>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-3 py-1 bg-cancel-1 text-white font-semibold rounded-lg text-xs hover:brightness-110 transition"
                            >
                                Réessayer
                            </button>
                        )}
                    </div>
                )}

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onBack}
                        className="px-5 py-3 bg-secondary text-text-primary font-semibold rounded-xl hover:bg-secondary/80 transition-all"
                    >
                        Retour
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
