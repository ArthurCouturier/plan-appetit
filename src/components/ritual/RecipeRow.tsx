import RecipeImageThumbnail from "../recipes/RecipeImageThumbnail";

interface RecipeRowProps {
    uuid: string;
    name: string;
    emoji?: string | null;
    courseCode?: string | null;
    totalTimeMin?: number | null;
    selected: boolean;
    onClick: () => void;
}

const COURSE_LABELS: Record<string, string> = {
    STARTER: "Entrée",
    MAIN: "Plat",
    DESSERT: "Dessert",
    SIDE: "Accompagnement",
    DRINK: "Boisson",
    APERITIF: "Apéritif",
    AMUSE_BOUCHE: "Amuse-bouche",
};

export default function RecipeRow({
    uuid,
    name,
    emoji,
    courseCode,
    totalTimeMin,
    selected,
    onClick,
}: RecipeRowProps) {
    const courseLabel = courseCode ? COURSE_LABELS[courseCode] ?? null : null;
    const timeLabel = totalTimeMin && totalTimeMin > 0 ? `${totalTimeMin} min` : null;
    const subtitle = [courseLabel, timeLabel].filter(Boolean).join(" · ");

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-2 rounded-xl border transition-colors text-left ${
                selected
                    ? "border-cout-yellow bg-cout-yellow/10"
                    : "border-border-color bg-secondary hover:border-cout-yellow"
            }`}
        >
            <RecipeImageThumbnail
                recipeUuid={uuid}
                recipeName={name}
                fallbackEmoji={emoji ?? null}
                className="w-12 h-12 shrink-0 rounded-lg border border-border-color"
                fallbackEmojiClassName="text-xl"
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary line-clamp-1">{name}</p>
                {subtitle && (
                    <p className="text-xs text-text-secondary line-clamp-1">{subtitle}</p>
                )}
            </div>
            {selected && (
                <span className="shrink-0 w-5 h-5 rounded-full bg-cout-yellow flex items-center justify-center text-cout-purple text-xs font-bold">
                    ✓
                </span>
            )}
        </button>
    );
}
