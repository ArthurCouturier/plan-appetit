import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { QUICK_SUGGESTIONS } from "../../data/fridgeIngredients";
import { searchIngredients, extractCurrentWord, replaceCurrentWord } from "../../api/utils/fuzzySearch";
import type { FridgeIngredient } from "../../data/fridgeIngredients";

const MAX_CHARS = 300;

interface FridgeStep1IngredientsProps {
    value: string;
    onChange: (value: string) => void;
    onNext: () => void;
}

export default function FridgeStep1Ingredients({ value, onChange, onNext }: FridgeStep1IngredientsProps) {
    const [suggestions, setSuggestions] = useState<FridgeIngredient[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState(-1);
    const [overLimit, setOverLimit] = useState(false);
    const [showLimitMsg, setShowLimitMsg] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const limitMsgTimer = useRef<ReturnType<typeof setTimeout>>();
    const borderTimer = useRef<ReturnType<typeof setTimeout>>();
    const shakeControls = useAnimation();

    const autoResize = useCallback(() => {
        const el = inputRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }, []);

    const triggerLimitFeedback = useCallback(() => {
        setOverLimit(true);
        setShowLimitMsg(true);

        shakeControls.start({
            rotate: [0, -2, 2, -2, 2, 0],
            transition: { duration: 0.4 },
        });

        clearTimeout(borderTimer.current);
        borderTimer.current = setTimeout(() => setOverLimit(false), 2000);

        clearTimeout(limitMsgTimer.current);
        limitMsgTimer.current = setTimeout(() => setShowLimitMsg(false), 5000);
    }, [shakeControls]);

    useEffect(() => {
        return () => {
            clearTimeout(limitMsgTimer.current);
            clearTimeout(borderTimer.current);
        };
    }, []);

    useEffect(() => {
        autoResize();
    }, [value, autoResize]);

    useEffect(() => {
        const { word } = extractCurrentWord(value);
        if (word.length >= 2) {
            const results = searchIngredients(word, 5);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
            setHoveredIndex(-1);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
            setHoveredIndex(-1);
        }
    }, [value]);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectSuggestion = useCallback((ingredient: FridgeIngredient) => {
        const newValue = replaceCurrentWord(value, ingredient.name.toLowerCase()) + " ";
        if (newValue.length > MAX_CHARS) {
            onChange(newValue.slice(0, MAX_CHARS));
            triggerLimitFeedback();
        } else {
            onChange(newValue);
        }
        setShowSuggestions(false);
        setHoveredIndex(-1);
        inputRef.current?.focus();
    }, [value, onChange, triggerLimitFeedback]);

    const handleChipClick = (ingredient: FridgeIngredient) => {
        const name = ingredient.name.toLowerCase();
        let newValue: string;
        if (value.trim().length === 0) {
            newValue = name + " ";
        } else {
            newValue = value.trim() + " et " + name + " ";
        }

        if (newValue.length > MAX_CHARS) {
            onChange(newValue.slice(0, MAX_CHARS));
            triggerLimitFeedback();
        } else {
            onChange(newValue);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        if (newValue.length > MAX_CHARS) {
            onChange(newValue.slice(0, MAX_CHARS));
            triggerLimitFeedback();
        } else {
            onChange(newValue);
        }
        autoResize();
    };

    const canProceed = value.trim().length >= 2;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown" && showSuggestions) {
            e.preventDefault();
            setHoveredIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === "ArrowUp" && showSuggestions) {
            e.preventDefault();
            setHoveredIndex((prev) => Math.max(prev - 1, -1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (showSuggestions && hoveredIndex >= 0 && hoveredIndex < suggestions.length) {
                selectSuggestion(suggestions[hoveredIndex]);
            } else if (canProceed && !showSuggestions) {
                onNext();
            } else if (showSuggestions) {
                setShowSuggestions(false);
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center justify-center min-h-[60vh] px-4"
        >
            <h2 className="text-2xl font-bold text-text-primary text-center mb-2">
                Qu'est-ce que tu veux vider dans ton frigo?
            </h2>
            <p className="text-text-secondary text-center mb-8 text-sm">
                Liste tes ingrédients principaux
            </p>

            {showLimitMsg && (
                <p className="text-red-500 text-sm font-semibold mb-2">Trop de caractères</p>
            )}

            <motion.div className="w-full max-w-md relative" ref={containerRef} animate={shakeControls}>
                <textarea
                    ref={inputRef}
                    value={value}
                    onChange={handleTextChange}
                    placeholder="Ex: poulet, courgettes et riz..."
                    className={`w-full bg-secondary text-text-primary placeholder-text-secondary px-5 py-4 rounded-xl border focus:outline-none focus:ring-2 text-lg resize-none overflow-hidden transition-colors duration-200 ${
                        overLimit
                            ? "border-red-500 focus:ring-red-500"
                            : "border-border-color focus:ring-cout-base"
                    }`}
                    rows={1}
                    autoFocus={false}
                    onKeyDown={handleKeyDown}
                />

                {showSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-primary border border-border-color rounded-xl shadow-lg z-10 overflow-hidden">
                        {suggestions.map((s, index) => (
                            <button
                                key={s.name}
                                onClick={() => selectSuggestion(s)}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(-1)}
                                className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 text-text-primary ${index === hoveredIndex ? "bg-cout-base/20" : "hover:bg-secondary"
                                    }`}
                            >
                                <span className="text-xl">{s.emoji}</span>
                                <span>{s.name}</span>
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>

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
