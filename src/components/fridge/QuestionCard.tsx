import { useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import type { FridgeQuestion } from "../../api/interfaces/fridge/FridgeInterfaces";

interface QuestionCardProps {
    question: FridgeQuestion;
    value: unknown;
    onChange: (value: unknown) => void;
    index: number;
    total: number;
}

const SWIPE_THRESHOLD = 80;

export default function QuestionCard({ question, value, onChange, index, total }: QuestionCardProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
    const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);
    const rightOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        setIsDragging(false);
        if (info.offset.x < -SWIPE_THRESHOLD) {
            applyMinValue();
        } else if (info.offset.x > SWIPE_THRESHOLD) {
            applyMaxValue();
        }
    };

    const applyMinValue = () => {
        switch (question.type) {
            case "slider":
                onChange(question.min ?? 0);
                break;
            case "level":
            case "choice":
                onChange(question.options?.[0] ?? "Non");
                break;
            case "boolean":
                onChange(false);
                break;
        }
    };

    const applyMaxValue = () => {
        switch (question.type) {
            case "slider":
                onChange(question.max ?? 6);
                break;
            case "level":
            case "choice": {
                const opts = question.options ?? [];
                onChange(opts[opts.length - 1] ?? "Beaucoup");
                break;
            }
            case "boolean":
                onChange(true);
                break;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="relative"
        >
            {/* Progress indicator */}
            <div className="text-xs text-text-secondary text-center mb-2">
                {index + 1}/{total}
            </div>

            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.3}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                style={{ x, rotate }}
                className="relative bg-primary border border-border-color rounded-2xl p-6 shadow-md cursor-grab active:cursor-grabbing touch-pan-y"
            >
                {/* Swipe indicators */}
                <motion.div
                    style={{ opacity: leftOpacity }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-cancel-1 font-bold text-sm pointer-events-none"
                >
                    Non ✕
                </motion.div>
                <motion.div
                    style={{ opacity: rightOpacity }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-confirmation-1 font-bold text-sm pointer-events-none"
                >
                    ✓ Oui
                </motion.div>

                {/* Question header */}
                <div className="flex items-center gap-3 mb-5">
                    <span className="text-3xl">{question.emoji}</span>
                    <h4 className="text-lg font-semibold text-text-primary">{question.label}</h4>
                </div>

                {/* Question controls */}
                <div
                    onClick={(e) => {
                        if (isDragging) e.stopPropagation();
                    }}
                >
                    {question.type === "slider" && (
                        <SliderControl question={question} value={value as number} onChange={onChange} />
                    )}
                    {question.type === "level" && (
                        <LevelControl options={question.options!} value={value as string} onChange={onChange} />
                    )}
                    {question.type === "boolean" && (
                        <BooleanControl value={value as boolean} onChange={onChange} />
                    )}
                    {question.type === "choice" && (
                        <ChoiceControl options={question.options!} value={value as string} onChange={onChange} />
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

function SliderControl({
    question,
    value,
    onChange,
}: {
    question: FridgeQuestion;
    value: number;
    onChange: (v: unknown) => void;
}) {
    const min = question.min ?? 0;
    const max = question.max ?? 6;
    const currentValue = value ?? min;

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <span className="text-text-secondary text-sm">{min}</span>
                <span className="text-2xl font-bold text-cout-purple">
                    {currentValue >= max ? question.plusLabel ?? `${max}+` : currentValue}
                </span>
                <span className="text-text-secondary text-sm">{question.plusLabel ?? max}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={currentValue}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-cout-base"
            />
        </div>
    );
}

function LevelControl({
    options,
    value,
    onChange,
}: {
    options: string[];
    value: string;
    onChange: (v: unknown) => void;
}) {
    return (
        <div className="flex gap-2">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    className={`flex-1 py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        value === option
                            ? "bg-cout-yellow text-cout-purple shadow-md scale-105"
                            : "bg-secondary text-text-primary border border-border-color hover:border-cout-base"
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}

function BooleanControl({
    value,
    onChange,
}: {
    value: boolean;
    onChange: (v: unknown) => void;
}) {
    return (
        <div className="flex gap-3">
            <button
                onClick={() => onChange(false)}
                className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 ${
                    value === false
                        ? "bg-cancel-1 text-white shadow-md scale-105"
                        : "bg-secondary text-text-primary border border-border-color hover:border-cancel-1"
                }`}
            >
                Non
            </button>
            <button
                onClick={() => onChange(true)}
                className={`flex-1 py-3 rounded-xl font-medium transition-all duration-200 ${
                    value === true
                        ? "bg-confirmation-1 text-white shadow-md scale-105"
                        : "bg-secondary text-text-primary border border-border-color hover:border-confirmation-1"
                }`}
            >
                Oui
            </button>
        </div>
    );
}

function ChoiceControl({
    options,
    value,
    onChange,
}: {
    options: string[];
    value: string;
    onChange: (v: unknown) => void;
}) {
    return (
        <div className="space-y-2">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => onChange(option)}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-medium text-left transition-all duration-200 ${
                        value === option
                            ? "bg-cout-yellow text-cout-purple shadow-md"
                            : "bg-secondary text-text-primary border border-border-color hover:border-cout-base"
                    }`}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
