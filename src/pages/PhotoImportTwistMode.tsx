import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../api/hooks/useAuth";
import PhotoImportService from "../api/services/PhotoImportService";
import SandboxService from "../api/services/SandboxService";
import { TrackingService } from "../api/tracking/TrackingService";
import { SKAdNetworkService } from "../api/tracking/skadnetwork/SKAdNetworkService";
import { SKAdNetworkConversionValue } from "../api/tracking/skadnetwork/SKAdNetworkConversionValue";
import { useInvalidateCollections } from "../api/hooks/useCollectionMutations";
import QuestionCard from "../components/fridge/QuestionCard";
import RecipeGenerationLoadingModal from "../components/modals/RecipeGenerationLoadingModal";
import CreditPaywallModal from "../components/modals/CreditPaywallModal";
import type { FridgeQuestion } from "../api/interfaces/fridge/FridgeInterfaces";

type Phase = "analyzing" | "questioning" | "generating";

/**
 * Page « Remasteriser » de l'import photo. Calque InstagramTwistMode (turn-by-turn,
 * AnimatePresence, cap dur 7 questions) mais l'analyse part de l'image base64 reçue
 * via location.state plutôt que d'une URL Instagram.
 */
export default function PhotoImportTwistMode() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const invalidateCollections = useInvalidateCollections();

    const imageBase64 = (location.state as { imageBase64?: string } | null)?.imageBase64 ?? null;

    const [phase, setPhase] = useState<Phase>("analyzing");
    const [analysisToken, setAnalysisToken] = useState<string | null>(null);
    const [askedQuestions, setAskedQuestions] = useState<FridgeQuestion[]>([]);
    const [answers, setAnswers] = useState<Record<string, unknown>>({});
    const [currentQuestion, setCurrentQuestion] = useState<FridgeQuestion | null>(null);
    const [isFetchingNext, setIsFetchingNext] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Si arrivé sans image (deep-link, refresh) → renvoyer vers la page d'import.
    useEffect(() => {
        if (!imageBase64) {
            navigate("/photo-import", { replace: true });
        }
    }, [imageBase64, navigate]);

    // Garde-fou contre le double-call du useEffect en React 18 StrictMode (dev).
    const initRef = useRef(false);

    useEffect(() => {
        if (!user || !imageBase64) return;
        if (initRef.current) return;
        initRef.current = true;

        const token = user.token || localStorage.getItem("firebaseIdToken");
        if (!token) { navigate("/login"); return; }

        PhotoImportService.startTwistQuestions(imageBase64, user.email, token)
            .then((res) => {
                setAnalysisToken(res.analysisToken);
                if (res.done || !res.question) {
                    finalizeAndGenerate(res.analysisToken, {});
                    return;
                }
                setCurrentQuestion(res.question);
                setPhase("questioning");
            })
            .catch((err: Error) => {
                setError(err.message || "Une erreur est survenue, recommence");
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAnswerCurrent = (value: unknown) => {
        if (!currentQuestion) return;
        setAnswers((a) => ({ ...a, [currentQuestion.id]: value }));
    };

    const handleNext = async () => {
        if (!user || !analysisToken || !currentQuestion) return;
        const token = user.token || localStorage.getItem("firebaseIdToken");
        if (!token) { navigate("/login"); return; }

        const updatedAsked = [...askedQuestions, currentQuestion];
        setAskedQuestions(updatedAsked);

        // Cap dur côté front (le back applique le sien aussi à 7).
        if (updatedAsked.length >= 7) {
            finalizeAndGenerate(analysisToken, answers);
            return;
        }

        setIsFetchingNext(true);
        try {
            const res = await PhotoImportService.nextTwistQuestion(
                analysisToken, updatedAsked, answers, user.email, token,
            );
            if (res.done || !res.question) {
                finalizeAndGenerate(analysisToken, answers);
                return;
            }
            setCurrentQuestion(res.question);
        } catch (err: any) {
            if (err?.type === "ANALYSIS_EXPIRED" || err?.status === 410) {
                setError("Analyse expirée, recommence depuis la photo");
                setTimeout(() => navigate("/photo-import", { replace: true }), 2000);
            } else {
                setError(err?.message || "Une erreur est survenue, réessaie");
            }
        } finally {
            setIsFetchingNext(false);
        }
    };

    const finalizeAndGenerate = async (
        token: string,
        finalAnswers: Record<string, unknown>,
    ) => {
        if (!user || !imageBase64) return;
        const idToken = user.token || localStorage.getItem("firebaseIdToken");
        if (!idToken) { navigate("/login"); return; }

        setPhase("generating");
        TrackingService.logRecipeGenerationInitiated("photo");

        try {
            const response = await PhotoImportService.generateRecipeFromPhoto(
                imageBase64, user.email, idToken,
                { analysisToken: token, answers: finalAnswers },
            );
            SandboxService.getQuotaStatus().catch(() => { });
            if (response.recipe?.uuid) {
                TrackingService.logRecipeGenerated("photo");
                SKAdNetworkService.updateConversionValue(SKAdNetworkConversionValue.ONE_RECIPE_GENERATED);
                invalidateCollections();
                navigate(`/recipes-v2/${response.recipe.uuid}`, { replace: true });
            } else {
                setError("Recette remasterisée mais identifiant manquant");
                setPhase("questioning");
            }
        } catch (err: any) {
            if (err?.type === "QUOTA_EXCEEDED" || err?.status === 402) {
                SKAdNetworkService.updateConversionValue(SKAdNetworkConversionValue.QUOTA_REACHED);
                setShowPaywall(true);
                setPhase("questioning");
            } else if (err?.type === "ANALYSIS_EXPIRED" || err?.status === 410) {
                setError("Analyse expirée, recommence depuis la photo");
                setTimeout(() => navigate("/photo-import", { replace: true }), 2000);
            } else {
                setError(err?.message || "Une erreur est survenue, réessaie");
                setPhase("questioning");
            }
        }
        // Asked & answers volontairement non clear ici — si erreur, l'user reste sur sa
        // dernière question pour ne pas perdre son travail.
    };

    const isCurrentAnswered = currentQuestion
        ? answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== null && answers[currentQuestion.id] !== ""
        : false;

    return (
        <>
            <div className="min-h-screen bg-bg-color pb-20" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 4rem)" }}>
                {error && (
                    <div className="max-w-md mx-auto mb-4 px-4">
                        <div className="bg-cancel-1/10 border border-cancel-1 text-cancel-1 px-4 py-3 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {phase === "analyzing" && (
                        <motion.div
                            key="analyzing"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="flex flex-col items-center justify-center min-h-[60vh] px-6"
                        >
                            <div className="relative w-20 h-20 mb-4">
                                <div className="absolute inset-0 border-4 border-cout-yellow/30 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-transparent border-t-cout-yellow rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl">✨</span>
                                </div>
                            </div>
                            <p className="text-text-primary font-semibold text-center">
                                On analyse cette photo...
                            </p>
                            <p className="text-text-secondary text-sm text-center mt-2 max-w-xs">
                                On analyse la photo et on prépare quelques questions pour comprendre ce que tu recherches.
                            </p>
                        </motion.div>
                    )}

                    {phase === "questioning" && currentQuestion && (
                        <motion.div
                            key={`q-${currentQuestion.id}`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="flex flex-col items-center px-4 pb-8"
                        >
                            <h2 className="text-xl font-bold text-text-primary text-center mb-6 mt-4">
                                Comment tu la veux ?
                            </h2>

                            <div className="w-full max-w-md">
                                <QuestionCard
                                    question={currentQuestion}
                                    value={answers[currentQuestion.id]}
                                    onChange={handleAnswerCurrent}
                                    index={askedQuestions.length}
                                    total={7}
                                    showProgress={false}
                                />
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={handleNext}
                                    disabled={!isCurrentAnswered || isFetchingNext}
                                    className="px-10 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg hover:brightness-110 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isFetchingNext ? "..." : (askedQuestions.length + 1 >= 7 ? "Lancer la remasterisation" : "Suivant")}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <RecipeGenerationLoadingModal isOpen={phase === "generating"} progress={null} />

            {showPaywall && <CreditPaywallModal onClose={() => setShowPaywall(false)} />}
        </>
    );
}
