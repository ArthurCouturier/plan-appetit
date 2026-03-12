import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bars3Icon } from "@heroicons/react/24/solid";
import RecipeSummaryInterface from "../../api/interfaces/recipes/RecipeSummaryInterface";

type SortableRecipeCardProps = {
    recipe: RecipeSummaryInterface;
};

export default function SortableRecipeCard({ recipe }: SortableRecipeCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `recipe-${recipe.uuid}`,
        data: { type: "recipe", recipe },
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 bg-primary border border-border-color rounded-xl px-4 py-3 shadow-sm select-none"
        >
            <div
                {...attributes}
                {...listeners}
                className="flex-shrink-0 p-2 -m-2 cursor-grab active:cursor-grabbing touch-none"
            >
                <Bars3Icon className="w-5 h-5 text-text-secondary" />
            </div>
            <span className="text-sm font-medium text-text-primary truncate">{recipe.name}</span>
        </div>
    );
}
