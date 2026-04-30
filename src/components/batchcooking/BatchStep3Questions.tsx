import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import QuestionCard from "../fridge/QuestionCard";
import type { FridgeQuestion } from "../../api/interfaces/fridge/FridgeInterfaces";
import BatchCookingService, {
    BatchCookingTurnHistory,
    BatchCookingTurnQuestion,
    BatchCookingTurnRequest,
} from "../../api/services/BatchCookingService";

/**
 * Step conversationnel BC. Pattern miroir de
 * [`GuidedStepView`](../guided-sandbox/GuidedStepView.tsx) : on délègue le rendu de la
 * question à `QuestionCard` (composant fridge riche, swipable, multi-types) via un
 * adapter `toFridgeQuestion`. Cette page ne fait qu'orchestrer le flow turn-by-turn
 * (fetch / état / navigation).
 */
interface BatchStep3QuestionsProps {
    turnContext: Omit<BatchCookingTurnRequest, "turnIndex" | "turns" | "skipQuestions">;
    onReady: (turns: BatchCookingTurnHistory[]) => void;
    onBack: () => void;
}

const MAX_TURNS = 7;

function toFridgeQuestion(q: BatchCookingTurnQuestion): FridgeQuestion {
    return {
        id: q.id,
        type: "choice",
        label: q.prompt,
        emoji: "",
        explanation: q.explanation ?? undefined,
        options: q.options.map((o) => o.label),
        allowFreeText: q.allowFreeText,
    };
}

export default function BatchStep3Questions({ turnContext, onReady, onBack }: BatchStep3QuestionsProps) {
    const [turns, setTurns] = useState<BatchCookingTurnHistory[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<BatchCookingTurnQuestion | null>(null);
    const [selectedLabel, setSelectedLabel] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNextQuestion = async (existingTurns: BatchCookingTurnHistory[]) => {
        setIsLoading(true);
        setError(null);
        setSelectedLabel("");

        try {
            const email = localStorage.getItem("email") ?? "";
            const token = localStorage.getItem("firebaseIdToken") ?? "";

            const response = await BatchCookingService.turn(
                {
                    ...turnContext,
                    turnIndex: existingTurns.length,
                    turns: existingTurns,
                },
                email,
                token,
            );

            if (response.ready || !response.nextQuestion) {
                onReady(existingTurns);
                return;
            }
            setCurrentQuestion(response.nextQuestion);
        } catch {
            setError("Impossible de charger la prochaine question. Réessaie.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNextQuestion([]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNext = () => {
        if (!currentQuestion || !selectedLabel.trim()) return;
        const newTurn: BatchCookingTurnHistory = {
            questionId: currentQuestion.id,
            questionPrompt: currentQuestion.prompt,
            answer: selectedLabel.trim(),
        };
        const updated = [...turns, newTurn];
        setTurns(updated);
        if (updated.length >= MAX_TURNS) {
            onReady(updated);
            return;
        }
        fetchNextQuestion(updated);
    };

    // Au-delà du max ou pendant la transition vers la génération, on n'affiche plus la card.
    if (turns.length >= MAX_TURNS) return null;

    return (
        <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center px-4 pb-8 w-full"
        >
            <div className="w-full max-w-md">
                {turns.length === 0 && (
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center mb-6">
                        Quelques questions et on y va!
                    </h2>
                )}

                {isLoading || !currentQuestion ? (
                    <div className="bg-primary border border-border-color rounded-2xl p-6 shadow-md animate-pulse">
                        <div className="h-6 bg-secondary rounded w-3/4 mb-6"></div>
                        <div className="space-y-3">
                            <div className="h-12 bg-secondary rounded-xl"></div>
                            <div className="h-12 bg-secondary rounded-xl"></div>
                            <div className="h-12 bg-secondary rounded-xl"></div>
                        </div>
                    </div>
                ) : (
                    <QuestionCard
                        question={toFridgeQuestion(currentQuestion)}
                        value={selectedLabel}
                        onChange={(v) => {
                            if (typeof v === "string") setSelectedLabel(v);
                        }}
                        index={turns.length}
                        total={MAX_TURNS}
                        showProgress={false}
                    />
                )}

                {error && (
                    <div className="mt-4 bg-cancel-1/10 border border-cancel-1 text-cancel-1 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 mt-6 justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 px-5 py-3 bg-secondary text-text-primary font-semibold rounded-xl hover:bg-secondary/80 transition-all"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                        Retour
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={!selectedLabel.trim() || isLoading}
                        className="flex items-center gap-2 px-8 py-3 bg-cout-yellow text-cout-purple font-bold rounded-xl hover:brightness-110 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-40 disabled:transform-none disabled:cursor-not-allowed"
                    >
                        Suivant
                        <ArrowRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
