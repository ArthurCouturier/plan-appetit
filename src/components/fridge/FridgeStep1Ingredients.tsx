import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { QUICK_SUGGESTIONS } from "../../data/fridgeIngredients";
import { searchIngredients, extractCurrentWord, replaceCurrentWord } from "../../api/utils/fuzzySearch";
import type { FridgeIngredient } from "../../data/fridgeIngredients";

interface FridgeStep1IngredientsProps {
    value: string;
    onChange: (value: string) => void;
    onNext: () => void;
}

export default function FridgeStep1Ingredients({ value, onChange, onNext }: FridgeStep1IngredientsProps) {
    const [suggestions, setSuggestions] = useState<FridgeIngredient[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const { word } = extractCurrentWord(value);
        if (word.length >= 2) {
            const results = searchIngredients(word, 5);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [value]);

    const handleSuggestionClick = (ingredient: FridgeIngredient) => {
        const newValue = replaceCurrentWord(value, ingredient.name.toLowerCase());
        onChange(newValue);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleChipClick = (ingredient: FridgeIngredient) => {
        const name = ingredient.name.toLowerCase();
        if (value.trim().length === 0) {
            onChange(name);
        } else {
            onChange(value.trim() + " et " + name);
        }
        inputRef.current?.focus();
    };

    const canProceed = value.trim().length >= 2;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center justify-center min-h-[60vh] px-4"
        >
            <h2 className="text-2xl font-bold text-text-primary text-center mb-2">
                Qu'est-ce que tu veux cuisiner ce soir ?
            </h2>
            <p className="text-text-secondary text-center mb-8 text-sm">
                Dis-nous ton ingrédient principal
            </p>

            <div className="w-full max-w-md relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value.slice(0, 100))}
                    placeholder="Ex: poulet, courgettes et riz..."
                    className="w-full bg-secondary text-text-primary placeholder-text-secondary px-5 py-4 rounded-xl border border-border-color focus:outline-none focus:ring-2 focus:ring-cout-base text-lg"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && canProceed) {
                            setShowSuggestions(false);
                            onNext();
                        }
                    }}
                />

                {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-color rounded-xl shadow-lg z-10 overflow-hidden">
                        {suggestions.map((s) => (
                            <button
                                key={s.name}
                                onClick={() => handleSuggestionClick(s)}
                                className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors flex items-center gap-3 text-text-primary"
                            >
                                <span className="text-xl">{s.emoji}</span>
                                <span>{s.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-8 max-w-md">
                {QUICK_SUGGESTIONS.map((ingredient) => (
                    <button
                        key={ingredient.name}
                        onClick={() => handleChipClick(ingredient)}
                        className="px-4 py-2 bg-secondary text-text-primary rounded-full border border-border-color hover:border-cout-base hover:bg-cout-base/10 transition-all text-sm flex items-center gap-1.5"
                    >
                        <span>{ingredient.emoji}</span>
                        <span>{ingredient.name}</span>
                    </button>
                ))}
            </div>

            <button
                onClick={onNext}
                disabled={!canProceed}
                className="mt-10 px-10 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl text-lg hover:brightness-110 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-40 disabled:transform-none disabled:cursor-not-allowed"
            >
                Suivant
            </button>
        </motion.div>
    );
}
