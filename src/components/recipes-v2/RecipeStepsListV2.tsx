import { useMemo, useState } from "react";
import {
    ArrowsRightLeftIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ClockIcon,
    FireIcon,
    LightBulbIcon,
} from "@heroicons/react/24/outline";
import {
    RecipeV2IngredientDTO,
    RecipeV2StepDTO,
    RecipeV2StepIngredientUsedDTO,
} from "../../api/interfaces/v2/RecipeV2";
import { formatHeatingSurfaceV2, formatQuantityV2 } from "./recipeV2Labels";

interface RecipeStepsListV2Props {
    steps: RecipeV2StepDTO[];
    ingredients?: RecipeV2IngredientDTO[];
}

export default function RecipeStepsListV2({ steps, ingredients = [] }: RecipeStepsListV2Props) {
    const sorted = useMemo(() => {
        return [...steps].sort((a, b) => {
            if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
            return a.stepKey - b.stepKey;
        });
    }, [steps]);

    const ingredientsByName = useMemo(() => {
        const map = new Map<string, RecipeV2IngredientDTO>();
        for (const ing of ingredients) {
            map.set(ing.name.trim().toLowerCase(), ing);
        }
        return map;
    }, [ingredients]);

    if (sorted.length === 0) {
        return (
            <p className="text-sm text-text-secondary italic">
                Aucune étape renseignée.
            </p>
        );
    }

    return (
        <ol className="space-y-4">
            {sorted.map((step, index) => (
                <StepRow
                    key={step.uuid}
                    step={step}
                    index={index + 1}
                    ingredientsByName={ingredientsByName}
                />
            ))}
        </ol>
    );
}

function StepRow({
    step,
    index,
    ingredientsByName,
}: {
    step: RecipeV2StepDTO;
    index: number;
    ingredientsByName: Map<string, RecipeV2IngredientDTO>;
}) {
    const [tipOpen, setTipOpen] = useState(false);

    const isPassive = step.stepType === "PASSIVE";
    const heatingLabel = formatHeatingSurfaceV2(step.heatingSurface);
    const temperatureLabel = step.temperatureC ? `${step.temperatureC}°C` : null;
    const hasHeatingInfo = heatingLabel || temperatureLabel || step.heatingIntensityLabel;
    const durationLabel = step.durationMin && step.durationMin > 0 ? `${step.durationMin} min` : null;
    const restLabel = step.restMin && step.restMin > 0 ? `Repos ${step.restMin} min` : null;

    return (
        <li className="flex gap-3">
            <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    isPassive
                        ? "bg-secondary text-text-secondary"
                        : "bg-cout-base text-white"
                }`}
                aria-label={isPassive ? "Étape passive" : "Étape active"}
            >
                {index}
            </div>
            <div className="flex-1 min-w-0">
                {step.title && (
                    <h3 className="font-semibold text-text-primary mb-1">
                        {step.title}
                    </h3>
                )}
                <p className="text-text-primary whitespace-pre-line break-words">
                    {step.instruction}
                </p>

                {step.ingredientsUsed && step.ingredientsUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {step.ingredientsUsed.map((ingredientUsed, idx) => (
                            <IngredientUsedChip
                                key={`${step.uuid}-${idx}-${ingredientUsed.name}`}
                                ingredientUsed={ingredientUsed}
                                ingredientsByName={ingredientsByName}
                            />
                        ))}
                    </div>
                )}

                {(durationLabel || restLabel || hasHeatingInfo || step.isParallelizable) && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {durationLabel && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-text-secondary">
                                <ClockIcon className="w-3.5 h-3.5" />
                                {durationLabel}
                            </span>
                        )}
                        {restLabel && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-text-secondary">
                                <ClockIcon className="w-3.5 h-3.5" />
                                {restLabel}
                            </span>
                        )}
                        {hasHeatingInfo && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">
                                <FireIcon className="w-3.5 h-3.5" />
                                {[heatingLabel, temperatureLabel, step.heatingIntensityLabel]
                                    .filter(Boolean)
                                    .join(" · ")}
                            </span>
                        )}
                        {step.isParallelizable && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-cout-purple/10 text-cout-purple">
                                <ArrowsRightLeftIcon className="w-3.5 h-3.5" />
                                En parallèle
                            </span>
                        )}
                    </div>
                )}

                {step.equipments && step.equipments.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {step.equipments.map((equipment) => (
                            <span
                                key={equipment}
                                className="text-[11px] px-2 py-0.5 rounded-md border border-border-color bg-primary text-text-secondary"
                            >
                                {equipment}
                            </span>
                        ))}
                    </div>
                )}

                {step.photoUrl && (
                    <img
                        src={step.photoUrl}
                        alt={step.title ?? `Étape ${index}`}
                        className="mt-3 rounded-lg max-h-64 object-cover w-full"
                    />
                )}

                {step.tipFr && (
                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={() => setTipOpen((v) => !v)}
                            className="inline-flex items-center gap-1.5 text-sm text-cout-base font-medium hover:underline"
                        >
                            <LightBulbIcon className="w-4 h-4" />
                            Astuce
                            {tipOpen ? (
                                <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                                <ChevronDownIcon className="w-4 h-4" />
                            )}
                        </button>
                        {tipOpen && (
                            <div className="mt-2 p-3 rounded-lg bg-cout-base/5 border border-cout-base/20 text-sm text-text-primary">
                                {step.tipFr}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </li>
    );
}

function IngredientUsedChip({
    ingredientUsed,
    ingredientsByName,
}: {
    ingredientUsed: RecipeV2StepIngredientUsedDTO;
    ingredientsByName: Map<string, RecipeV2IngredientDTO>;
}) {
    const match = ingredientsByName.get(ingredientUsed.name.trim().toLowerCase());
    const emoji = match?.emoji ?? null;
    const quantityLabel = formatQuantityV2(ingredientUsed.quantity, ingredientUsed.unitCode);
    const parts = [
        emoji,
        ingredientUsed.name,
        quantityLabel ? `· ${quantityLabel}` : null,
    ].filter(Boolean);

    return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-border-color bg-secondary text-text-primary">
            {parts.join(" ")}
        </span>
    );
}
