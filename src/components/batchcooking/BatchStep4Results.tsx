import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/solid";
import { errorHaptic } from "../../haptics/error";
import { lightHaptic } from "../../haptics/light";
import TabSlider, { type TabSliderHandle } from "../common/TabSlider";
import type {
    BatchCookingResponse,
    BatchCookingShoppingItem,
    BatchCookingExecutionStep,
} from "../../api/interfaces/batchcooking/BatchCookingInterfaces";
import RecipeCard from "../cards/RecipeCard";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import { useRecipeImageVisible } from "../../api/hooks/useRecipeImageBatch";
import BackendService from "../../api/services/BackendService";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../api/queryConfig";

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

const TABS: Tab[] = ["recipes", "shopping", "planning"];

export default function BatchStep4Results({ batchCooking, onDelete }: BatchStep4ResultsProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = (searchParams.get("tab") as Tab) || "recipes";
    const isNew = searchParams.get("new") === "1";
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const peopleCount = batchCooking.config.defaultPeopleCount ?? 2;
    const perPerson = peopleCount > 0 ? batchCooking.estimatedCost.total / peopleCount : 0;

    const TAB_ITEMS = [
        { id: "recipes", label: "📋 Recettes" },
        { id: "shopping", label: "🛒 Courses" },
        { id: "planning", label: "📅 Planning" },
    ];

    // Pre-fetch all recipe images on mount
    const queryClient = useQueryClient();
    useEffect(() => {
        const uuids = batchCooking.recipes.map((r) => String(r.uuid));
        const uncached = uuids.filter((uuid) => queryClient.getQueryData(queryKeys.recipes.image(uuid)) === undefined);
        if (uncached.length === 0) return;

        BackendService.getRecipeImagesBatch(uncached).then(({ images }) => {
            for (const uuid of uncached) {
                queryClient.setQueryData(queryKeys.recipes.image(uuid), images[uuid] || null);
            }
        }).catch(() => { });
    }, [batchCooking.recipes, queryClient]);

    const tabSliderRef = useRef<TabSliderHandle>(null);
    const stickyRef = useRef<HTMLDivElement>(null);

    // Called by TabSlider (click/drag)
    const changeTab = useCallback((tab: Tab) => {
        setActiveTab(tab);
        setSearchParams({ tab }, { replace: true });
        // Scroll to top of sticky tabs
        const sticky = stickyRef.current;
        if (sticky) {
            const top = sticky.getBoundingClientRect().top + window.scrollY - 1;
            window.scrollTo({ top, behavior: "smooth" });
        }
    }, [setSearchParams]);

    // Called by content swipe
    const swipeToTab = useCallback((tab: Tab) => {
        setActiveTab(tab);
        setSearchParams({ tab }, { replace: true });
        lightHaptic();
        requestAnimationFrame(() => tabSliderRef.current?.animateTransition());
        const sticky = stickyRef.current;
        if (sticky) {
            const top = sticky.getBoundingClientRect().top + window.scrollY - 1;
            window.scrollTo({ top, behavior: "smooth" });
        }
    }, [setSearchParams]);

    // Swipe handling
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const [bounceX, setBounceX] = useState(0);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest("[data-recipe-card]")) {
            touchStartRef.current = null;
            return;
        }
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        const start = touchStartRef.current;
        if (!start) return;
        touchStartRef.current = null;

        const deltaX = e.changedTouches[0].clientX - start.x;
        const deltaY = e.changedTouches[0].clientY - start.y;
        const threshold = window.innerWidth * 0.1;

        if (Math.abs(deltaX) < threshold || Math.abs(deltaY) > Math.abs(deltaX)) return;

        const currentIndex = TABS.indexOf(activeTab);

        if (deltaX < 0) {
            if (currentIndex < TABS.length - 1) {
                swipeToTab(TABS[currentIndex + 1]);
            } else {
                errorHaptic();
                setBounceX(-10);
                setTimeout(() => setBounceX(0), 100);
            }
        } else {
            if (currentIndex > 0) {
                swipeToTab(TABS[currentIndex - 1]);
            } else {
                errorHaptic();
                setBounceX(10);
                setTimeout(() => setBounceX(0), 100);
            }
        }
    }, [activeTab, swipeToTab]);

    const deleteButton = onDelete ? (
        <div className="flex justify-center py-8">
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
    ) : null;

    return (
        <motion.div
            initial={isNew ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 pb-8"
        >
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary mb-1">
                    {batchCooking.name}
                </h2>
            </div>

            {/* Cost summary */}
            <div className="flex justify-center gap-4 mb-4">
                <div className="bg-secondary rounded-xl px-4 py-3 text-center">
                    <div className="text-lg font-bold text-cout-yellow">
                        {batchCooking.estimatedCost.total.toFixed(2)}€
                    </div>
                    <div className="text-xs text-text-secondary">Total</div>
                </div>
                <div className="bg-secondary rounded-xl px-4 py-3 text-center">
                    <div className="text-lg font-bold text-cout-yellow">
                        {batchCooking.estimatedCost.perMeal.toFixed(2)}€
                    </div>
                    <div className="text-xs text-text-secondary">/ repas</div>
                </div>
                <div className="bg-secondary rounded-xl px-4 py-3 text-center">
                    <div className="text-lg font-bold text-cout-yellow">
                        {perPerson.toFixed(2)}€
                    </div>
                    <div className="text-xs text-text-secondary">/ personne</div>
                </div>
            </div>

            {/* Sticky Tabs */}
            <div ref={stickyRef} className="sticky z-40 bg-transparent py-2 top-[calc(env(safe-area-inset-top,0px))] md:!top-0">
                <TabSlider ref={tabSliderRef} tabs={TAB_ITEMS} activeTab={activeTab} onChange={(id) => changeTab(id as Tab)} />
            </div>

            {/* Tab content - all panels mounted, inactive hidden via display:none */}
            <div
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="max-w-md mx-auto"
                style={{
                    transform: bounceX !== 0 ? `translateX(${bounceX}px)` : undefined,
                    transition: bounceX !== 0 ? "transform 100ms" : undefined,
                }}
            >
                <div style={{ display: activeTab === "recipes" ? undefined : "none" }}>
                    <div className="grid grid-cols-2 gap-3">
                        {batchCooking.recipes.map((recipe) => (
                            <RecipeCard
                                key={String(recipe.uuid)}
                                recipe={recipe}
                            />
                        ))}
                    </div>
                </div>
                <div style={{ display: activeTab === "shopping" ? undefined : "none" }}>
                    <ShoppingTab items={batchCooking.shoppingList} recipes={batchCooking.recipes} />
                </div>
                <div style={{ display: activeTab === "planning" ? undefined : "none" }}>
                    <PlanningTab steps={batchCooking.executionPlan} />
                </div>
                {deleteButton}
            </div>
        </motion.div>
    );
}

function ShoppingRecipeThumb({ recipeUuid, onClick }: { recipeUuid: string; onClick: () => void }) {
    const { data: imageData } = useRecipeImageVisible(recipeUuid);
    return (
        <button
            onClick={onClick} className="rounded shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
            style={{ width: "min(16vw, 8vh)", height: "min(16vw, 8vh)" }}
        >
            {imageData ? (
                <img src={`data:image/png;base64,${imageData}`} alt="" className="w-full h-full object-cover" draggable={false} />
            ) : (
                <div className="w-full h-full bg-border-color" />
            )}
        </button>
    );
}

function ShoppingTab({ items, recipes }: { items: BatchCookingShoppingItem[]; recipes: RecipeInterface[] }) {
    const navigate = useNavigate();
    const grouped = groupByCategory(items);
    const totalPrice = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const recipeMap = new Map(recipes.map((r) => [String(r.uuid), r.name]));

    return (
        <div className="space-y-6">
            {Object.entries(grouped).map(([category, catItems]) => (
                <div key={category}>
                    <h4 className="text-sm font-bold text-text-secondary mb-2">
                        {CATEGORY_LABELS[category] || category}
                    </h4>
                    <div className="space-y-2">
                        {catItems.map((item) => {
                            const isExpanded = expandedId === item.uuid;
                            const linkedRecipes = item.recipeUuids
                                .map((uuid) => ({ uuid, name: recipeMap.get(uuid) }))
                                .filter((r) => r.name);

                            return (
                                <div key={item.uuid}>
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : item.uuid)}
                                        className="w-full flex items-center justify-between bg-secondary rounded-lg px-4 py-3 transition-colors hover:bg-secondary/80"
                                    >
                                        <div className="text-left">
                                            <span className="text-text-primary text-sm font-medium">{item.name}</span>
                                            <span className="text-text-secondary text-xs ml-2">
                                                {item.totalQuantity} {UNIT_LABELS[item.unit || ""] || item.unit}
                                            </span>
                                        </div>
                                        <span className="text-cout-yellow text-sm font-semibold shrink-0">
                                            {item.estimatedPrice.toFixed(2)}€
                                        </span>
                                    </button>
                                    <AnimatePresence>
                                        {isExpanded && linkedRecipes.length > 0 && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="py-2 flex flex-wrap gap-2 justify-center">
                                                    {linkedRecipes.map((r) => (
                                                        <ShoppingRecipeThumb key={r.uuid} recipeUuid={r.uuid} onClick={() => navigate(`/recettes/${r.uuid}`)} />
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            <div className="border-t border-border-color pt-3 flex justify-between">
                <span className="font-bold text-text-primary">Total estime</span>
                <span className="font-bold text-cout-yellow">{totalPrice.toFixed(2)}€</span>
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
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${step.stepType === "PASSIVE"
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
