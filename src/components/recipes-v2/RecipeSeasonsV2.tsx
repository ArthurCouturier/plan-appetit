import { formatSeasonV2 } from "./recipeV2Labels";

export default function RecipeSeasonsV2({ seasons }: { seasons: string[] }) {
    if (!seasons || seasons.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {seasons.map((season) => (
                <span
                    key={season}
                    className="px-3 py-1 rounded-full bg-secondary border border-border-color text-xs font-medium text-text-primary"
                >
                    {formatSeasonV2(season)}
                </span>
            ))}
        </div>
    );
}
