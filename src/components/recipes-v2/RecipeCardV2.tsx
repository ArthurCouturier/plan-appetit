import { useNavigate } from "react-router-dom";
import { ClockIcon } from "@heroicons/react/24/outline";
import { UserGroupIcon } from "@heroicons/react/24/solid";
import { RecipeV2DTO, RecipeV2SummaryDTO } from "../../api/interfaces/v2/RecipeV2";
import { formatCourseV2, formatSeasonV2 } from "./recipeV2Labels";

type RecipeCardV2Recipe = RecipeV2DTO | RecipeV2SummaryDTO;

interface RecipeCardV2Props {
    recipe: RecipeCardV2Recipe;
    onClick?: (uuid: string) => void;
}

function formatTotal(min: number | null): string | null {
    if (min === null || min === undefined || min <= 0) return null;
    if (min < 60) return `${min} min`;
    const hours = Math.floor(min / 60);
    const remainder = min % 60;
    if (remainder === 0) return `${hours} h`;
    return `${hours} h ${remainder.toString().padStart(2, "0")}`;
}

export default function RecipeCardV2({ recipe, onClick }: RecipeCardV2Props) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick(recipe.uuid);
            return;
        }
        navigate(`/recipes-v2/${recipe.uuid}`);
    };

    const totalLabel = formatTotal(recipe.totalTimeMin ?? recipe.prepTimeMin ?? null);
    const courseLabel = formatCourseV2(recipe.courseCode);

    return (
        <button
            type="button"
            onClick={handleClick}
            className="w-full text-left bg-primary border border-border-color rounded-xl shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_2px_4px_rgba(0,0,0,0.1)] hover:border-cout-base transition-colors duration-200 overflow-hidden"
        >
            <div className="aspect-[4/3] w-full flex items-center justify-center bg-secondary/50">
                <span className="text-5xl" aria-hidden>
                    {recipe.emoji ?? "🍽️"}
                </span>
            </div>

            <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-text-primary text-sm line-clamp-2 flex-1">
                        {recipe.name}
                    </h3>
                    {courseLabel && (
                        <span className="flex-shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-cout-base/10 text-cout-base font-semibold">
                            {courseLabel}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                    <span className="inline-flex items-center gap-1">
                        <UserGroupIcon className="w-3.5 h-3.5 text-cout-base" />
                        {recipe.covers > 0 ? recipe.covers : "?"}
                    </span>
                    {totalLabel && (
                        <span className="inline-flex items-center gap-1">
                            <ClockIcon className="w-3.5 h-3.5 text-cout-base" />
                            {totalLabel}
                        </span>
                    )}
                </div>

                {recipe.seasons && recipe.seasons.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {recipe.seasons.slice(0, 3).map((season) => (
                            <span
                                key={season}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-text-secondary"
                            >
                                {formatSeasonV2(season)}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </button>
    );
}
