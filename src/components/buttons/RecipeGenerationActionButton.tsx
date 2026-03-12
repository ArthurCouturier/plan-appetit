import { useNavigate } from "react-router-dom";

export type RecipeGenerationType =
    | "sandbox"
    | "fridge"
    | "location"
    | "ingredient"
    | "batch"
    | "budget";

interface VariantConfig {
    title: string;
    subtitle: string;
    subtitleColor: string;
    icon: string;
    gradientFrom: string;
    gradientTo: string;
    route: string | null;
}

const VARIANTS: Record<RecipeGenerationType, VariantConfig> = {
    sandbox: {
        title: "Laisse moi faire!",
        subtitle: "Mets en place ton idée",
        subtitleColor: "#edc79e",
        icon: "/icons/IconStars.svg",
        gradientFrom: "#eda391",
        gradientTo: "#f17c63",
        route: "/recettes/generer/sandbox",
    },
    fridge: {
        title: "Vide mon frigo!",
        subtitle: "Pour cuisiner les restes",
        subtitleColor: "#d2a575",
        icon: "/icons/IconFridge.svg",
        gradientFrom: "#caf0f8",
        gradientTo: "#90e0ef",
        route: "/frigo",
    },
    location: {
        title: "Recette typique de...",
        subtitle: "Un vrai voyage culinaire",
        subtitleColor: "#ffe1c1",
        icon: "/icons/IconLocalize.svg",
        gradientFrom: "#80ed99",
        gradientTo: "#57cc99",
        route: "/recettes/generer/localisation",
    },
    ingredient: {
        title: "Quoi cuisiner avec?",
        subtitle: "Cuisine autour de cet aliment",
        subtitleColor: "#e5d1ba",
        icon: "/icons/IconVegetables.svg",
        gradientFrom: "#e0aaff",
        gradientTo: "#c77dff",
        route: null,
    },
    batch: {
        title: "Batch cookons...",
        subtitle: "Prévois ta semaine en 1 clic",
        subtitleColor: "#e2d1c0",
        icon: "/icons/IconMarmite.svg",
        gradientFrom: "#d69f7e",
        gradientTo: "#cd9777",
        route: null,
    },
    budget: {
        title: "Voici mon budget!",
        subtitle: "Pas besoin de se ruiner",
        subtitleColor: "#e1994d",
        icon: "/icons/IconEuro.svg",
        gradientFrom: "#ffdd00",
        gradientTo: "#ffd000",
        route: null,
    },
};

interface RecipeGenerationActionButtonProps {
    type: RecipeGenerationType;
}

export default function RecipeGenerationActionButton({ type }: RecipeGenerationActionButtonProps) {
    const navigate = useNavigate();
    const config = VARIANTS[type];
    const comingSoon = config.route === null;

    const handleClick = () => {
        if (!comingSoon && config.route) {
            navigate(config.route);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={comingSoon}
            className={`relative w-full overflow-hidden rounded-[12px] h-full flex items-center gap-[16px] px-[24px] text-left transition-all duration-200 ${
                comingSoon
                    ? "cursor-default"
                    : "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
            }`}
            style={{
                background: `linear-gradient(to bottom, ${config.gradientFrom}, ${config.gradientTo})`,
            }}
        >
            <div className="flex-shrink-0 w-[56px] h-[56px] bg-white/20 rounded-[12px] flex items-center justify-center">
                <img src={config.icon} alt="" className="w-[32px] h-[32px]" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-[12px]">
                <h3 className="text-[20px] font-extrabold text-white leading-[28px] text-sora truncate">
                    {config.title}
                </h3>
                <p
                    className="text-[12px] font-bold leading-[16px] text-sora truncate"
                    style={{ color: config.subtitleColor }}
                >
                    {config.subtitle}
                </p>
            </div>

            {comingSoon && (
                <div className="absolute inset-0 rounded-[12px] bg-gray-900/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-[15px] italic">
                        Bientôt disponible...
                    </span>
                </div>
            )}
        </button>
    );
}
