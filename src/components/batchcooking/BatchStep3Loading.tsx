import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_MESSAGES = [
    "On verifie ce qui est de saison...",
    "On equilibre les proteines...",
    "On optimise le planning de cuisson...",
    "On consolide la liste de courses...",
    "On calcule les couts...",
    "On verifie la coherence du batch...",
    "On peaufine les recettes...",
];

interface BatchStep3LoadingProps {
    isLoading: boolean;
}

export default function BatchStep3Loading({ isLoading }: BatchStep3LoadingProps) {
    const [messageIndex, setMessageIndex] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval>>();

    useEffect(() => {
        if (isLoading) {
            setMessageIndex(0);
            intervalRef.current = setInterval(() => {
                setMessageIndex((prev) => {
                    if (prev < LOADING_MESSAGES.length - 1) return prev + 1;
                    return prev;
                });
            }, 4000);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isLoading]);

    if (!isLoading) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] px-4"
        >
            {/* Animated cooking pot */}
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-cout-yellow/30 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-cout-yellow rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">🍲</span>
                </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-2 mb-6">
                {LOADING_MESSAGES.map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${
                            i <= messageIndex ? "bg-cout-yellow scale-110" : "bg-secondary"
                        }`}
                    />
                ))}
            </div>

            {/* Animated message */}
            <AnimatePresence mode="wait">
                <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-text-secondary text-center text-sm font-medium"
                >
                    {LOADING_MESSAGES[messageIndex]}
                </motion.p>
            </AnimatePresence>

            {/* Subtle bounce dots */}
            <div className="flex gap-1.5 mt-6">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 bg-cout-yellow rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.15,
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
}
