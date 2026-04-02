import { useState } from "react";
import { motion } from "framer-motion";
import { TrashIcon } from "@heroicons/react/24/solid";
import type {
    BatchCookingResponse,
    BatchCookingShoppingItem,
    BatchCookingExecutionStep,
} from "../../api/interfaces/batchcooking/BatchCookingInterfaces";
import RecipeCard from "../cards/RecipeCard";

interface BatchStep4ResultsProps {
    batchCooking: BatchCookingResponse;
    onDelete?: () => void;
}

type Tab = "recipes" | "shopping" | "planning";

const CATEGORY_LABELS: Record<string, string> = {
    MEAT: "Viandes",
    FISH: "Poissons",
    VEGETABLE: "Legumes",
    FRUIT: "Fruits",
    DAIRY: "Produits laitiers",
    CEREAL: "Cereales & feculents",
    SPECIES: "Epices",
    HERB: "Herbes",
    OTHER: "Autres",
};

const UNIT_LABELS: Record<string, string> = {
    GRAM: "g",
    KILOGRAM: "kg",
    MILLILITER: "ml",
    CENTILITER: "cl",
    LITER: "L",
    PIECE: "pc",
    NONE: "",
};

function groupByCategory(items: BatchCookingShoppingItem[]): Record<string, BatchCookingShoppingItem[]> {
    return items.reduce((acc, item) => {
        const cat = item.category || "OTHER";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, BatchCookingShoppingItem[]>);
}

function formatMinutes(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m.toString().padStart(2, "0")}`;
}

export default function BatchStep4Results({ batchCooking, onDelete }: BatchStep4ResultsProps) {
    const [activeTab, setActiveTab] = useState<Tab>("recipes");
    const peopleCount = batchCooking.config.defaultPeopleCount ?? 2;
    const perPerson = peopleCount > 0 ? batchCooking.estimatedCost.total / peopleCount : 0;

    const tabs: { id: Tab; label: string; emoji: string }[] = [
        { id: "recipes", label: "Recettes", emoji: "📋" },
        { id: "shopping", label: "Courses", emoji: "🛒" },
        { id: "planning", label: "Planning", emoji: "📅" },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 pb-8"
        >
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-1">
                    {batchCooking.name}
                </h2>
                <p className="text-text-secondary text-sm">
                    {batchCooking.recipes.length} recettes generees
                </p>
            </div>

            {/* Cost summary */}
            <div className="flex justify-center gap-4 mb-6">
                <div className="bg-secondary rounded-xl px-4 py-3 text-center">
                    <div className="text-lg font-bold text-cout-yellow">
                        {batchCooking.estimatedCost.total.toFixed(2)}EUR
                    </div>
                    <div className="text-xs text-text-secondary">Total</div>
                </div>
                <div className="bg-secondary rounded-xl px-4 py-3 text-center">
                    <div className="text-lg font-bold text-cout-yellow">
                        {batchCooking.estimatedCost.perMeal.toFixed(2)}EUR
                    </div>
                    <div className="text-xs text-text-secondary">/ repas</div>
                </div>
                <div className="bg-secondary rounded-xl px-4 py-3 text-center">
                    <div className="text-lg font-bold text-cout-yellow">
                        {perPerson.toFixed(2)}EUR
                    </div>
                    <div className="text-xs text-text-secondary">/ personne</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-secondary rounded-xl p-1 mb-6 max-w-md mx-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === tab.id
                                ? "bg-cout-yellow text-cout-purple shadow-sm"
                                : "text-text-secondary"
                        }`}
                    >
                        {tab.emoji} {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="max-w-md mx-auto">
                {activeTab === "recipes" && (
                    <div className="grid grid-cols-2 gap-3">
                        {batchCooking.recipes.map((recipe) => (
                            <RecipeCard
                                key={String(recipe.uuid)}
                                recipe={recipe}
                            />
                        ))}
                    </div>
                )}
                {activeTab === "shopping" && (
                    <ShoppingTab items={batchCooking.shoppingList} />
                )}
                {activeTab === "planning" && (
                    <PlanningTab steps={batchCooking.executionPlan} />
                )}
            </div>

            {/* Delete button */}
            {onDelete && (
                <div className="flex justify-center mt-8 max-w-md mx-auto">
                    <button
                        onClick={() => {
                            if (confirm(`Supprimer "${batchCooking.name}" et toutes ses recettes ?`)) {
                                onDelete();
                            }
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary border-2 border-red-500/50 text-red-600 font-semibold rounded-xl hover:bg-red-500/10 transition-all duration-200"
                    >
                        <TrashIcon className="w-5 h-5" />
                        Supprimer le batch cooking
                    </button>
                </div>
            )}
        </motion.div>
    );
}

function ShoppingTab({ items }: { items: BatchCookingShoppingItem[] }) {
    const grouped = groupByCategory(items);
    const totalPrice = items.reduce((sum, item) => sum + item.estimatedPrice, 0);

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([category, catItems]) => (
                <div key={category}>
                    <h4 className="text-sm font-bold text-text-secondary mb-2">
                        {CATEGORY_LABELS[category] || category}
                    </h4>
                    <div className="space-y-2">
                        {catItems.map((item) => (
                            <div key={item.uuid} className="flex items-center justify-between bg-secondary rounded-lg px-4 py-3">
                                <div>
                                    <span className="text-text-primary text-sm font-medium">{item.name}</span>
                                    <span className="text-text-secondary text-xs ml-2">
                                        {item.totalQuantity} {UNIT_LABELS[item.unit || ""] || item.unit}
                                    </span>
                                </div>
                                <span className="text-cout-yellow text-sm font-semibold">
                                    {item.estimatedPrice.toFixed(2)}EUR
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="border-t border-border-color pt-3 flex justify-between">
                <span className="font-bold text-text-primary">Total estime</span>
                <span className="font-bold text-cout-yellow">{totalPrice.toFixed(2)}EUR</span>
            </div>
        </div>
    );
}

function PlanningTab({ steps }: { steps: BatchCookingExecutionStep[] }) {
    if (steps.length === 0) {
        return <p className="text-text-secondary text-center text-sm">Aucun planning disponible</p>;
    }

    const totalMinutes = steps.reduce((sum, s) => {
        if (s.stepType === "ACTIVE") return sum + (s.durationMinutes ?? 0);
        return sum;
    }, 0);

    const totalWithPassive = steps.reduce((sum, s) => sum + (s.durationMinutes ?? 0), 0);

    return (
        <div className="space-y-3">
            <div className="flex justify-center gap-4 mb-4">
                <div className="text-center">
                    <div className="text-sm font-bold text-cout-yellow">{formatMinutes(totalMinutes)}</div>
                    <div className="text-xs text-text-secondary">actif</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-bold text-text-secondary">{formatMinutes(totalWithPassive)}</div>
                    <div className="text-xs text-text-secondary">total</div>
                </div>
            </div>

            {steps
                .sort((a, b) => a.executionOrder - b.executionOrder)
                .map((step, index) => (
                <div
                    key={step.uuid || index}
                    className="bg-secondary rounded-xl p-4"
                >
                    {/* Step number + type badge */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-cout-yellow/20 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-cout-yellow">{index + 1}</span>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            step.stepType === "PASSIVE"
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-cout-yellow/10 text-cout-yellow"
                        }`}>
                            {step.stepType === "PASSIVE" ? "Passif" : "Actif"}
                        </span>
                        {step.durationMinutes && (
                            <span className="text-xs text-text-secondary ml-auto">
                                {formatMinutes(step.durationMinutes)}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-text-primary leading-relaxed mb-2">
                        {step.description}
                    </p>

                    {/* Recipe tags */}
                    <div className="flex flex-wrap gap-1.5 mb-1">
                        {step.recipeNames.map((name) => (
                            <span
                                key={name}
                                className="text-xs bg-primary border border-border-color text-text-secondary rounded-full px-2.5 py-0.5"
                            >
                                {name}
                            </span>
                        ))}
                    </div>

                    {/* Tip */}
                    {step.tip && (
                        <div className="mt-2 flex items-start gap-1.5 text-xs text-cout-yellow">
                            <span className="shrink-0">💡</span>
                            <span>{step.tip}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
