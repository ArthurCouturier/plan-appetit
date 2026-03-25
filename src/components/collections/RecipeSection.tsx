import { useMemo } from "react";
import { DocumentTextIcon, CheckIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/solid";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import RecipeSummaryInterface from "../../api/interfaces/recipes/RecipeSummaryInterface";
import RecipeCard from "../cards/RecipeCard";
import SortableRecipeCard from "../dnd/SortableRecipeCard";
import RecipeSortSelect, { RecipeSortOption, sortRecipes } from "./RecipeSortSelect";

interface RecipeSectionProps {
    recipes: RecipeSummaryInterface[];
    collectionUuid: string;
    sortOption: RecipeSortOption;
    onSortChange: (sort: RecipeSortOption) => void;
    isReordering: boolean;
    onStartReorder: () => void;
    onValidateReorder: () => void;
    onCancelReorder: () => void;
}

export default function RecipeSection({
    recipes,
    collectionUuid,
    sortOption,
    onSortChange,
    isReordering,
    onStartReorder,
    onValidateReorder,
    onCancelReorder,
}: RecipeSectionProps) {
    const sortedRecipes = useMemo(() => sortRecipes(recipes, sortOption), [recipes, sortOption]);

    if (recipes.length === 0) return null;

    return (
        <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
                <DocumentTextIcon className="w-5 h-5 md:w-6 md:h-6 text-cout-base" />
                <h2 className="text-lg md:text-xl font-bold text-text-primary">Recettes</h2>
                <span className="text-text-secondary text-sm">({recipes.length})</span>
                {!isReordering && (
                    <RecipeSortSelect
                        collectionUuid={collectionUuid}
                        currentSort={sortOption}
                        onSortChange={onSortChange}
                    />
                )}
                {isReordering ? (
                    <div className="flex items-center gap-2 ml-auto">
                        <button
                            onClick={onCancelReorder}
                            className="flex items-center gap-1 px-3 py-1.5 bg-cancel-1 text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all"
                        >
                            <XMarkIcon className="w-4 h-4" />
                            Annuler
                        </button>
                        <button
                            onClick={onValidateReorder}
                            className="flex items-center gap-1 px-3 py-1.5 bg-confirmation-1 text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all"
                        >
                            <CheckIcon className="w-4 h-4" />
                            Valider
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={onStartReorder}
                        className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                        title="Réorganiser les recettes"
                    >
                        <PencilIcon className="w-4 h-4 text-cout-base" />
                    </button>
                )}
            </div>
            {isReordering ? (
                <SortableContext
                    items={recipes.map(r => `recipe-${r.uuid}`)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="flex flex-col gap-2 md:max-w-lg">
                        {recipes.map((recipe) => (
                            <SortableRecipeCard
                                key={String(recipe.uuid)}
                                recipe={recipe}
                            />
                        ))}
                    </div>
                </SortableContext>
            ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] md:gap-4">
                    {sortedRecipes.map((recipe) => (
                        <RecipeCard
                            key={String(recipe.uuid)}
                            recipe={recipe}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
