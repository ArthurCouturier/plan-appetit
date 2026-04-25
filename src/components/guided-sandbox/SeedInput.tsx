import { motion } from "framer-motion";
import { SparklesIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import AnimatedGradientBox from "../sandbox/AnimatedGradientBox";
import { useTypingPlaceholder } from "../../hooks/useTypingPlaceholder";

interface SeedInputProps {
    seed: string;
    onSeedChange: (value: string) => void;
    onSubmit: () => void;
    onSurprise: () => void;
    disabled?: boolean;
    error?: string | null;
    onRetry?: () => void;
}

const PLACEHOLDERS = [
    "Un dahl de lentilles corail pour ce soir",
    "Une recette rapide avec des courgettes",
    "Un dessert sans lactose aux poires",
    "Un plat réconfortant pour l'hiver",
    "Un curry thaï végétalien express",
    "Des tapas espagnoles pour l'apéro",
];

export default function SeedInput({
    seed,
    onSeedChange,
    onSubmit,
    onSurprise,
    disabled,
    error,
    onRetry,
}: SeedInputProps) {
    const animatedPlaceholder = useTypingPlaceholder({
        phrases: PLACEHOLDERS,
        typingSpeed: 80,
        deletingSpeed: 50,
        pauseDuration: 2000,
    });

    const canSubmit = seed.trim().length >= 3 && !disabled;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (canSubmit) {
                onSubmit();
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center min-h-[60vh] px-4 w-full"
        >
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">
                        Qu'est-ce qu'on cuisine ?
                    </h2>
                    <p className="text-text-secondary text-sm md:text-base">
                        Décris librement ton envie, on t'accompagne en 3 questions.
                    </p>
                </div>

                <AnimatedGradientBox
                    value={seed}
                    onChange={(e) => onSeedChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    animatedPlaceholder={animatedPlaceholder}
                    disabled={disabled}
                    aria-label="Décris ton envie de recette"
                />

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

                <div className="mt-8 flex flex-col items-center gap-3">
                    <button
                        onClick={onSubmit}
                        disabled={!canSubmit}
                        className="w-full md:w-auto px-10 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg shadow-lg hover:brightness-110 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        C'est parti
                    </button>

                    <button
                        onClick={onSurprise}
                        disabled={disabled}
                        className="px-6 py-3 bg-secondary text-text-primary font-semibold rounded-xl border border-border-color hover:border-cout-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Surprends-moi
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
