import { motion } from "framer-motion";
import type { TimeCategory } from "../../api/interfaces/fridge/FridgeInterfaces";

interface FridgeStep2ContextProps {
    servings: number;
    timeCategory: TimeCategory;
    onServingsChange: (servings: number) => void;
    onTimeCategoryChange: (timeCategory: TimeCategory) => void;
    onNext: () => void;
    onBack: () => void;
}

const TIME_OPTIONS: { value: TimeCategory; emoji: string; label: string; sub: string }[] = [
    { value: "express", emoji: "⚡", label: "Express", sub: "< 20 min" },
    { value: "normal", emoji: "🍳", label: "Normal", sub: "20-40 min" },
    { value: "long", emoji: "🔪", label: "Je prends mon temps", sub: "40 min+" },
];

export default function FridgeStep2Context({
    servings,
    timeCategory,
    onServingsChange,
    onTimeCategoryChange,
    onNext,
    onBack,
}: FridgeStep2ContextProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center justify-center min-h-[60vh] px-4"
        >
            <div className="w-full max-w-md space-y-10">
                {/* Nombre de personnes */}
                <div>
                    <h3 className="text-xl font-bold text-text-primary text-center mb-6">
                        Pour combien de personnes ?
                    </h3>
                    <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                onClick={() => onServingsChange(n)}
                                className={`w-14 h-14 rounded-full text-lg font-bold transition-all duration-200 ${
                                    servings === n
                                        ? "bg-cout-yellow text-cout-purple scale-110 shadow-lg"
                                        : "bg-secondary text-text-primary border border-border-color hover:border-cout-base"
                                }`}
                            >
                                {n === 5 ? "5+" : n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Temps disponible */}
                <div>
                    <h3 className="text-xl font-bold text-text-primary text-center mb-6">
                        Tu as combien de temps ?
                    </h3>
                    <div className="space-y-3">
                        {TIME_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => onTimeCategoryChange(option.value)}
                                className={`w-full px-5 py-4 rounded-xl text-left transition-all duration-200 flex items-center gap-4 ${
                                    timeCategory === option.value
                                        ? "bg-cout-yellow/20 border-2 border-cout-yellow text-text-primary scale-[1.02]"
                                        : "bg-secondary border border-border-color text-text-primary hover:border-cout-base"
                                }`}
                            >
                                <span className="text-2xl">{option.emoji}</span>
                                <div>
                                    <div className="font-semibold">{option.label}</div>
                                    <div className="text-sm text-text-secondary">{option.sub}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 mt-10">
                <button
                    onClick={onBack}
                    className="px-8 py-4 bg-secondary text-text-primary font-semibold rounded-xl hover:bg-secondary/80 transition-all"
                >
                    Retour
                </button>
                <button
                    onClick={onNext}
                    className="px-10 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg hover:brightness-110 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                    Suivant
                </button>
            </div>
        </motion.div>
    );
}
