import { useState } from "react";
import { motion } from "framer-motion";

interface FridgeStep5RecipeChoiceProps {
    recipes: string[];
    onSelect: (title: string) => void;
}

export default function FridgeStep5RecipeChoice({ recipes, onSelect }: FridgeStep5RecipeChoiceProps) {
    const [selected, setSelected] = useState<string | null>(null);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center justify-center min-h-[60vh] px-4"
        >
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <span className="text-5xl mb-4 block">👨‍🍳</span>
                    <h2 className="text-2xl font-bold text-text-primary mb-2">
                        Qu'est-ce qu'on prépare ?
                    </h2>
                    <p className="text-text-secondary text-sm">
                        Choisis la recette qui te fait envie
                    </p>
                </div>

                <div className="space-y-3 mb-8">
                    {recipes.map((title, index) => (
                        <motion.button
                            key={title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            onClick={() => setSelected(title)}
                            className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                                selected === title
                                    ? "bg-cout-base/15 border-cout-base text-text-primary"
                                    : "bg-secondary border-border-color text-text-primary hover:border-cout-base/50"
                            }`}
                        >
                            <span className="font-medium">{title}</span>
                        </motion.button>
                    ))}
                </div>

                <button
                    onClick={() => selected && onSelect(selected)}
                    disabled={!selected}
                    className="w-full px-8 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg hover:brightness-110 transform hover:scale-[1.02] transition-all duration-300 shadow-lg disabled:opacity-40 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    <span>✨</span> Générer cette recette
                </button>
            </div>
        </motion.div>
    );
}
