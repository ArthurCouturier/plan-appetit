import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeftIcon, ArrowPathIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import QuestionCard from "../fridge/QuestionCard";
import type { FridgeQuestion } from "../../api/interfaces/fridge/FridgeInterfaces";
import type { GuidedSandboxQuestion } from "../../api/interfaces/guided-sandbox/GuidedSandboxTypes";

interface GuidedStepViewProps {
    question: GuidedSandboxQuestion;
    turnIndex: number;
    totalTurns: number;
    initialChoice?: string;
    onSubmit: (choice: string) => void;
    onBack: () => void;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
}

const CUSTOM_VALUE_PREFIX = "__custom__:";

function toFridgeQuestion(q: GuidedSandboxQuestion): FridgeQuestion {
    return {
        id: q.id,
        type: "choice",
        label: q.prompt,
        emoji: "",
        options: q.options.map((o) => o.label),
        allowFreeText: q.allowFreeText,
    };
}

export default function GuidedStepView({
    question,
    turnIndex,
    totalTurns,
    initialChoice,
    onSubmit,
    onBack,
    loading,
    error,
    onRetry,
}: GuidedStepViewProps) {
    const initialLabel = (() => {
        if (!initialChoice) return "";
        if (initialChoice.startsWith(CUSTOM_VALUE_PREFIX)) {
            return initialChoice.slice(CUSTOM_VALUE_PREFIX.length);
        }
        const opt = question.options.find((o) => o.value === initialChoice);
        return opt ? opt.label : initialChoice;
    })();

    const [selectedLabel, setSelectedLabel] = useState<string>(initialLabel);

    useEffect(() => {
        setSelectedLabel(initialLabel);
    }, [question.id, initialLabel]);

    const handleChange = (value: unknown) => {
        if (typeof value === "string") {
            setSelectedLabel(value);
        }
    };

    const resolveChoice = (): string | null => {
        if (!selectedLabel || selectedLabel.trim().length === 0) return null;
        const option = question.options.find((o) => o.label === selectedLabel);
        if (option) return option.value;
        if (question.allowFreeText) {
            return `${CUSTOM_VALUE_PREFIX}${selectedLabel.trim()}`;
        }
        return null;
    };

    const choice = resolveChoice();
    const canProceed = choice !== null && !loading;

    const fridgeQuestion = toFridgeQuestion(question);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center px-4 pb-8 w-full"
        >
            <div className="w-full max-w-md">
                {loading ? (
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
                        question={fridgeQuestion}
                        value={selectedLabel}
                        onChange={handleChange}
                        index={turnIndex}
                        total={totalTurns}
                    />
                )}

                {error && (
                    <div className="mt-4 bg-cancel-1/10 border border-cancel-1 text-cancel-1 px-4 py-3 rounded-xl text-sm flex items-center justify-between gap-3">
                        <span>{error}</span>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-cancel-1 text-white font-semibold rounded-lg text-xs hover:brightness-110 transition"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                Réessayer
                            </button>
                        )}
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
                        onClick={() => {
                            if (choice) onSubmit(choice);
                        }}
                        disabled={!canProceed}
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
