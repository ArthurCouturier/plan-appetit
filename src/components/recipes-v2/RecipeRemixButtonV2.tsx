import { SparklesIcon } from "@heroicons/react/24/outline";

interface RecipeRemixButtonV2Props {
    recipeUuid: string;
    fullWidth?: boolean;
    className?: string;
}

export default function RecipeRemixButtonV2({
    fullWidth = false,
    className = "",
}: RecipeRemixButtonV2Props) {
    const widthClass = fullWidth ? "w-full" : "";
    return (
        <button
            type="button"
            disabled
            aria-disabled="true"
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-300 text-gray-700 font-semibold rounded-lg cursor-not-allowed opacity-70 whitespace-nowrap ${widthClass} ${className}`}
        >
            <SparklesIcon className="w-5 h-5 flex-shrink-0" />
            <span>Bientôt disponible</span>
        </button>
    );
}
