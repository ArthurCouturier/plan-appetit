import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { lightHaptic } from "../../haptics/light";
import type { BudgetTarget } from "../../api/interfaces/batchcooking/BatchCookingInterfaces";
import EquipmentCard from "./EquipmentCard";
import ChipToPickList from "../common/ChipToPickList";
import cuisineStylesData from "../../data/cuisineStyles.json";
import equipmentsData from "../../data/equipments.json";
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
    { value: "ECONOMICAL", icon: "/icons/IconEuro.svg", label: "Economique" },
    { value: "BALANCED", icon: "/icons/IconBalance.svg", label: "Equilibre" },
    { value: "COMFORT", icon: "/icons/IconStars.svg", label: "Confort" },
];

function toggleInList(list: string[], item: string): string[] {
    return list.includes(item) ? list.filter((s) => s !== item) : [...list, item];
}

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
    const [showAllEquipment, setShowAllEquipment] = useState(false);
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
            <h2 className="text-2xl font-bold text-text-primary text-center mb-2">
                Tes preferences
            </h2>
            <p className="text-text-secondary text-center mb-8 text-sm">
                Affine le style de ton batch
            </p>

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
                <EquipmentSection
                    equipment={equipment}
                    showAll={showAllEquipment}
                    onToggleShowAll={() => setShowAllEquipment(!showAllEquipment)}
                    onEquipmentChange={onEquipmentChange}
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
                        Ingredients exclus
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
                        className={`px-10 py-4 font-bold rounded-xl text-lg transition-all duration-300 shadow-lg ${
                            showWarning
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-cout-yellow text-cout-purple hover:brightness-110 transform hover:scale-105"
                        }`}
                    >
                        Generer
                    </button>
                </div>
                {showWarning && (
                    <p className="text-red-500 text-xs text-center font-medium">
                        "{pendingValues.join('", "')}" non applique{pendingValues.length > 1 ? "s" : ""}, continuer quand meme ?
                    </p>
                )}
            </div>
        </motion.div>
    );
}

// --- Equipment section with responsive grid + "voir plus" ---

function useColumnsCount(): number {
    const [cols, setCols] = useState(3);

    useState(() => {
        const update = () => {
            const w = window.innerWidth;
            if (w >= 1024) setCols(5);
            else if (w >= 768) setCols(4);
            else setCols(3);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    });

    return cols;
}

function EquipmentSection({
    equipment,
    showAll,
    onToggleShowAll,
    onEquipmentChange,
}: {
    equipment: string[];
    showAll: boolean;
    onToggleShowAll: () => void;
    onEquipmentChange: (eq: string[]) => void;
}) {
    const cols = useColumnsCount();
    const collapsedCount = cols * 3;
    const needsToggle = equipmentsData.length > collapsedCount;
    const visibleEquipments = showAll ? equipmentsData : equipmentsData.slice(0, collapsedCount);

    return (
        <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
                Equipement disponible
            </h3>
            <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
                {visibleEquipments.map((eq) => (
                    <EquipmentCard
                        key={eq.name}
                        name={eq.name}
                        icon={eq.icon}
                        selected={equipment.includes(eq.name)}
                        onToggle={() => onEquipmentChange(toggleInList(equipment, eq.name))}
                    />
                ))}
            </div>
            <div className="my-4">
                {needsToggle && (
                    <button
                        onClick={() => { onToggleShowAll(); lightHaptic(); }}
                        className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 bg-secondary opacity-50 text-text-primary border border-border-color mx-auto"
                    >
                        <span className="text-lg">{showAll ? "▲" : "▼"}</span>
                        <span className="text-xs font-semibold">{showAll ? "Voir moins" : "Voir plus"}</span>
                    </button>
                )}
            </div>
        </div>
    );
}
