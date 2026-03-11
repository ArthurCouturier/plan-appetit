import { motion } from "framer-motion";
import type { FridgeQuestion } from "../../api/interfaces/fridge/FridgeInterfaces";
import QuestionCard from "./QuestionCard";

interface FridgeStep3QuestionsProps {
    questions: FridgeQuestion[];
    answers: Record<string, unknown>;
    onAnswerChange: (questionId: string, value: unknown) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function FridgeStep3Questions({
    questions,
    answers,
    onAnswerChange,
    onNext,
    onBack,
}: FridgeStep3QuestionsProps) {
    const answeredCount = Object.keys(answers).filter((key) => {
        const val = answers[key];
        return val !== undefined && val !== null;
    }).length;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center px-4 pb-8"
        >
            <h2 className="text-xl font-bold text-text-primary text-center mb-2 mt-4">
                Qu'as-tu dans le frigo ?
            </h2>
            <p className="text-text-secondary text-center mb-6 text-sm">
                Swipe ou réponds directement
            </p>

            {/* Progress bar */}
            <div className="w-full max-w-md mb-6">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-cout-base rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Question cards */}
            <div className="w-full max-w-md space-y-4">
                {questions.map((question, index) => (
                    <QuestionCard
                        key={question.id}
                        question={question}
                        value={answers[question.id]}
                        onChange={(value) => onAnswerChange(question.id, value)}
                        index={index}
                        total={questions.length}
                    />
                ))}
            </div>

            <div className="flex gap-4 mt-8">
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
