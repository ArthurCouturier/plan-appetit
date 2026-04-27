import { Link } from "react-router-dom";
import { SparklesIcon } from "@heroicons/react/24/outline";

interface RecipeRemixButtonV2Props {
    recipeUuid: string;
    fullWidth?: boolean;
    className?: string;
}

export default function RecipeRemixButtonV2({
    recipeUuid,
    fullWidth = false,
    className = "",
}: RecipeRemixButtonV2Props) {
    const widthClass = fullWidth ? "w-full" : "";
    return (
        <Link
            to={`/sandbox?remix=${recipeUuid}`}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cout-base to-cout-purple text-white font-semibold rounded-lg hover:shadow-lg transition-all whitespace-nowrap ${widthClass} ${className}`}
        >
            <SparklesIcon className="w-5 h-5 flex-shrink-0" />
            <span>Retravailler la recette</span>
        </Link>
    );
}
