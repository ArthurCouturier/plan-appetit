import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useNavigate } from "react-router-dom";
import RecipeInterface from "../../api/interfaces/recipes/RecipeInterface";
import RecipeSummaryInterface from "../../api/interfaces/recipes/RecipeSummaryInterface";
import { ChevronRightIcon, UserGroupIcon, CurrencyEuroIcon, DocumentTextIcon, Bars3Icon } from "@heroicons/react/24/solid";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import DropPlaceholder from "./DropPlaceholder";

type DraggableRecipeCardProps = {
    recipe: RecipeInterface | RecipeSummaryInterface;
    isMobile?: boolean;
};

function getStepsCount(recipe: RecipeInterface | RecipeSummaryInterface): number {
    if ('stepsCount' in recipe) {
        return recipe.stepsCount;
    }
    return recipe.steps.length;
}

export default function DraggableRecipeCard({ recipe, isMobile }: DraggableRecipeCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `recipe-${recipe.uuid}`,
        data: {
            type: 'recipe',
            recipe,
        },
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={style}>
                <DropPlaceholder isMobile={isMobile} />
            </div>
        );
    }

    return isMobile ? (
        <DraggableRecipeCardMobile
            recipe={recipe}
            style={style}
            attributes={attributes}
            listeners={listeners}
            setNodeRef={setNodeRef}
        />
    ) : (
        <DraggableRecipeCardDesktop
            recipe={recipe}
            style={style}
            attributes={attributes}
            listeners={listeners}
            setNodeRef={setNodeRef}
        />
    );
}

type DraggableCardInnerProps = {
    recipe: RecipeInterface | RecipeSummaryInterface;
    style: React.CSSProperties;
    attributes: DraggableAttributes;
    listeners: SyntheticListenerMap | undefined;
    setNodeRef: (node: HTMLElement | null) => void;
};

function DraggableRecipeCardMobile({
    recipe,
    style,
    attributes,
    listeners,
    setNodeRef,
}: DraggableCardInnerProps) {
    const navigate = useNavigate();
    const stepsCount = getStepsCount(recipe);

    const handleClick = () => {
        navigate(`/recettes/${recipe.uuid}`);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="w-full bg-primary rounded-xl shadow-md border border-border-color p-4 hover:shadow-lg hover:border-cout-base transition-all duration-200 select-none flex items-center gap-3"
        >
            {/* Drag handle */}
            <div
                {...attributes}
                {...listeners}
                className="flex-shrink-0 p-2 -m-2 cursor-grab active:cursor-grabbing touch-none"
            >
                <Bars3Icon className="w-5 h-5 text-text-secondary" />
            </div>

            {/* Clickable content */}
            <div onClick={handleClick} className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            <DocumentTextIcon className="w-5 h-5 text-cout-base flex-shrink-0" />
                            <h3 className="text-lg font-bold text-text-primary line-clamp-1">
                                {recipe.name}
                            </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                            <div className="flex items-center gap-1">
                                <UserGroupIcon className="w-4 h-4 text-cout-base" />
                                <span>{recipe.covers} pers</span>
                            </div>

                            <span>{stepsCount} étape{stepsCount > 1 ? 's' : ''}</span>

                            {recipe.buyPrice > 0 && (
                                <div className="flex items-center gap-1">
                                    <CurrencyEuroIcon className="w-4 h-4 text-cout-yellow" />
                                    <span>{Number(recipe.buyPrice).toFixed(2)}€/pers</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <ChevronRightIcon className="w-6 h-6 text-cout-base flex-shrink-0 ml-2" />
                </div>
            </div>
        </div>
    );
}

function DraggableRecipeCardDesktop({
    recipe,
    style,
    attributes,
    listeners,
    setNodeRef,
}: DraggableCardInnerProps) {
    const navigate = useNavigate();
    const stepsCount = getStepsCount(recipe);

    const handleClick = () => {
        navigate(`/recettes/${recipe.uuid}`);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={handleClick}
            className="group bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg border-2 border-border-color hover:border-cout-base p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-left h-full flex flex-col cursor-grab active:cursor-grabbing touch-none"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 flex-1">
                    <DocumentTextIcon className="w-6 h-6 text-cout-base flex-shrink-0" />
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-cout-base transition-colors line-clamp-2">
                        {recipe.name}
                    </h3>
                </div>
            </div>

            <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2 text-text-secondary">
                    <UserGroupIcon className="w-5 h-5 text-cout-base" />
                    <span className="text-sm font-medium">{recipe.covers} personne{recipe.covers > 1 ? 's' : ''}</span>
                </div>

                <div className="flex items-center gap-2 text-text-secondary">
                    <span className="text-sm font-medium">{stepsCount} étape{stepsCount > 1 ? 's' : ''}</span>
                </div>

                {recipe.buyPrice > 0.01 && (
                    <div className="flex items-center gap-2 text-text-secondary">
                        <CurrencyEuroIcon className="w-5 h-5 text-cout-yellow" />
                        <span className="text-sm font-medium">{Number(recipe.buyPrice).toFixed(2)}€ par personne</span>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-border-color">
                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-cout-yellow/20 rounded-lg">
                    <span className="text-sm font-bold text-cout-base">
                        Voir la recette
                    </span>
                </div>
            </div>
        </div>
    );
}
