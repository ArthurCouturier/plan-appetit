import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { lightHaptic } from "../../haptics/light";
import { errorHaptic } from "../../haptics/error";
import type { BudgetTarget } from "../../api/interfaces/batchcooking/BatchCookingInterfaces";
import ChipToPickList from "../common/ChipToPickList";
import EquipmentSelector from "../shared/EquipmentSelector";
import cuisineStylesData from "../../data/cuisineStyles.json";
import dietaryRestrictionsData from "../../data/dietaryRestrictions.json";

interface BatchStep2PreferencesProps {
    cuisineStyles: string[];
    equipment: string[];
    budgetTarget: BudgetTarget;
    excludedIngredients: string[];
    dietaryRestrictions: string[];
    onCuisineStylesChange: (styles: string[]) => void;
    onEquipmentChange: (eq: string[]) => void;
    onBudgetTargetChange: (budget: BudgetTarget) => void;
    onExcludedIngredientsChange: (ingredients: string[]) => void;
    onDietaryRestrictionsChange: (restrictions: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const BUDGET_OPTIONS: { value: BudgetTarget; icon: string; label: string }[] = [
    { value: "ECONOMICAL", icon: "/icons/IconEuro.svg", label: "Économique" },
    { value: "BALANCED", icon: "/icons/IconBalance.svg", label: "Équilibre" },
    { value: "COMFORT", icon: "/icons/IconStars.svg", label: "Confort" },
];

export default function BatchStep2Preferences({
    cuisineStyles,
    equipment,
    budgetTarget,
    excludedIngredients,
    dietaryRestrictions,
    onCuisineStylesChange,
    onEquipmentChange,
    onBudgetTargetChange,
    onExcludedIngredientsChange,
    onDietaryRestrictionsChange,
    onNext,
    onBack,
}: BatchStep2PreferencesProps) {
    const [pendingOthers, setPendingOthers] = useState<Record<string, string>>({});
    const [showWarning, setShowWarning] = useState(false);

    const updatePending = useCallback((key: string) => (value: string) => {
        setPendingOthers((prev) => {
            if (value) return { ...prev, [key]: value };
            const next = { ...prev };
            delete next[key];
            return next;
        });
        setShowWarning(false);
    }, []);

    const pendingValues = Object.values(pendingOthers).filter(Boolean);

    const handleNext = () => {
        if (pendingValues.length > 0 && !showWarning) {
            setShowWarning(true);
            errorHaptic();
            return;
        }
        setShowWarning(false);
        onNext();
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center px-4 pb-8"
        >
            <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
                Tes préférences
            </h2>

            <div className="w-full max-w-md md:max-w-lg lg:max-w-2xl space-y-8">
                {/* Style culinaire */}
                <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-3">
                        Style culinaire
                    </h3>
                    <ChipToPickList
                        items={cuisineStylesData}
                        selected={cuisineStyles}
                        onChange={onCuisineStylesChange}
                        otherPlaceholder="Autre style..."
                        onPendingOtherChange={updatePending("style")}
                    />
                </div>

                {/* Equipement */}
                <EquipmentSelector
                    selected={equipment}
                    onChange={onEquipmentChange}
                />

                {/* Budget */}
                <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-3">
                        Budget
                    </h3>
                    <div className="flex gap-3 mx-2">
                        {BUDGET_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => { onBudgetTargetChange(option.value); lightHaptic(); }}
                                className={`flex-1 px-4 py-3 rounded-xl text-center transition-all duration-200 ${budgetTarget === option.value
                                    ? "bg-cout-yellow/20 border-2 border-cout-yellow text-text-primary"
                                    : "bg-secondary border-2 border-border-color text-text-primary hover:border-cout-base"
                                    }`}
                            >
                                <img
                                    src={option.icon}
                                    alt={option.label}
                                    className="w-6 h-6 mx-auto mb-1"
                                    style={{ filter: budgetTarget === option.value ? "invert(1)" : "invert(1)" }}
                                    draggable={false}
                                />
                                <div className="text-xs font-semibold">{option.label}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Restrictions alimentaires */}
                <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-3">
                        Restrictions alimentaires
                    </h3>
                    <ChipToPickList
                        items={dietaryRestrictionsData}
                        selected={dietaryRestrictions}
                        onChange={onDietaryRestrictionsChange}
                        otherPlaceholder="Autre restriction..."
                        onPendingOtherChange={updatePending("restriction")}
                    />
                </div>

                {/* Ingredients exclus */}
                <div>
                    <h3 className="text-sm font-semibold text-text-secondary mb-3">
                        Ingrédients exclus
                    </h3>
                    <ChipToPickList
                        items={[]}
                        selected={excludedIngredients}
                        onChange={onExcludedIngredientsChange}
                        otherPlaceholder="Ex: coriandre"
                        onPendingOtherChange={updatePending("exclusion")}
                    />
                </div>
            </div>

            <div className="flex flex-col items-center mt-10 gap-2">
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="px-8 py-4 bg-secondary text-text-primary font-semibold rounded-xl hover:bg-secondary/80 transition-all"
                    >
                        Retour
                    </button>
                    <button
                        onClick={handleNext}
                        className={`px-10 py-4 font-bold rounded-xl text-lg transition-all duration-300 shadow-lg ${showWarning
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-cout-yellow text-cout-purple hover:brightness-110 transform hover:scale-105"
                            }`}
                    >
                        {showWarning ? "Continuer" : "Générer"}
                    </button>
                </div>
                {showWarning && (
                    <p className="text-red-500 text-xs text-center font-medium">
                        "{pendingValues.join('", "')}" non appliqué{pendingValues.length > 1 ? "s" : ""}, continuer quand même ?
                    </p>
                )}
            </div>
        </motion.div>
    );
}

