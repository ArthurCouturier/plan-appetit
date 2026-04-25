import { useMemo } from "react";
import { RecipeV2IngredientDTO } from "../../api/interfaces/v2/RecipeV2";
import {
    formatIngredientCategoryV2,
    formatQuantityV2,
} from "./recipeV2Labels";

const GROUPING_THRESHOLD = 8;

interface IngredientsListV2Props {
    ingredients: RecipeV2IngredientDTO[];
}

export default function IngredientsListV2({ ingredients }: IngredientsListV2Props) {
    const sorted = useMemo(() => {
        return [...ingredients].sort((a, b) => a.displayOrder - b.displayOrder);
    }, [ingredients]);

    const grouped = useMemo(() => {
        const map = new Map<string, RecipeV2IngredientDTO[]>();
        for (const ingredient of sorted) {
            const key = (ingredient.categoryCode || "OTHER").toUpperCase();
            const bucket = map.get(key);
            if (bucket) {
                bucket.push(ingredient);
            } else {
                map.set(key, [ingredient]);
            }
        }
        return map;
    }, [sorted]);

    if (sorted.length === 0) {
        return (
            <p className="text-sm text-text-secondary italic">
                Aucun ingrédient renseigné.
            </p>
        );
    }

    const shouldGroup = sorted.length > GROUPING_THRESHOLD && grouped.size > 1;

    if (!shouldGroup) {
        return (
            <ul className="space-y-2">
                {sorted.map((ingredient) => (
                    <IngredientRow key={ingredient.uuid} ingredient={ingredient} />
                ))}
            </ul>
        );
    }

    return (
        <div className="space-y-4">
            {Array.from(grouped.entries()).map(([category, list]) => (
                <div key={category}>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-text-secondary mb-2">
                        {formatIngredientCategoryV2(category)}
                    </h3>
                    <ul className="space-y-2">
                        {list.map((ingredient) => (
                            <IngredientRow key={ingredient.uuid} ingredient={ingredient} />
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

function IngredientRow({ ingredient }: { ingredient: RecipeV2IngredientDTO }) {
    const quantityLabel = formatQuantityV2(ingredient.quantity, ingredient.unitCode);

    return (
        <li className="flex items-start gap-3 py-1.5 border-b border-border-color last:border-b-0">
            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-base">
                {ingredient.emoji ?? "•"}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium text-text-primary">
                        {ingredient.name}
                    </span>
                    {quantityLabel && (
                        <span className="text-sm text-text-secondary">
                            {quantityLabel}
                        </span>
                    )}
                    {ingredient.isOptional && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-text-secondary">
                            optionnel
                        </span>
                    )}
                </div>
                {ingredient.preparationNote && (
                    <p className="text-xs text-text-secondary italic mt-0.5">
                        {ingredient.preparationNote}
                    </p>
                )}
            </div>
        </li>
    );
}
