import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ALL_SAMPLE_RECIPES = [
    { image: "/onboarding/images_webp/05174abd-b372-4c04-8575-dbd473d4189f.webp", name: "Pizza margherita basilic et mozzarella" },
    { image: "/onboarding/images_webp/ea04f482-4ab9-40c6-8738-7df29851a703.webp", name: "Tarte aux légumes grillés" },
    { image: "/onboarding/images_webp/4fd16d3a-1e72-494d-8e51-d83f7fae0ea0.webp", name: "Blanquette de veau à l'ancienne" },
    { image: "/onboarding/images_webp/d30db61d-f4ac-440c-bb3f-0babd66cca6a.webp", name: "Brioches aux pépites de chocolat" },
    { image: "/onboarding/images_webp/b4e8f9b2-eb87-4a7b-8fc9-71a21b75b20f.webp", name: "Bûche de Noël au chocolat et framboises" },
    { image: "/onboarding/images_webp/d6bace87-d5c3-4ea5-b742-17a343ca5adf.webp", name: "Raviolis à la courge butternut" },
    { image: "/onboarding/images_webp/fb758fa1-db60-49d0-a40c-43a9e0478cf2.webp", name: "Bowl boeuf mariné, riz et oeuf" },
    { image: "/onboarding/images_webp/864d018f-ed80-4c1d-a03c-51c89b8af3ee.webp", name: "Lasagnes bolognaise gratinées" },
    { image: "/onboarding/images_webp/74db77d0-07e8-4802-a14e-78298a525831.webp", name: "Tartare de thon et avocat" },
    { image: "/onboarding/images_webp/157cde0c-33cf-4325-bff4-9c0e32c8a34b.webp", name: "Mousse au chocolat faite maison" },
    { image: "/onboarding/images_webp/70815820-1a09-4e80-b4fa-0481a7652bd7.webp", name: "Galette des rois frangipane" },
    { image: "/onboarding/images_webp/9be7e954-8b19-443b-a3c2-f098ba6b792d.webp", name: "Gratin de pâtes au fromage" },
    { image: "/onboarding/images_webp/3910d178-f061-4bf1-998b-0f75744cabc8.webp", name: "Oeufs pochés aux asperges vertes" },
    { image: "/onboarding/images_webp/3264c4a8-ebfc-4898-b519-14be6ba83ed6.webp", name: "Foie gras maison et confiture" },
];

function pickRandom<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

export default function SampleRecipeShowcase() {
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [renderedIndex, setRenderedIndex] = useState<number | null>(null);
    const [showOverlay, setShowOverlay] = useState(false);

    const recipes = useMemo(() => pickRandom(ALL_SAMPLE_RECIPES, 3), []);

    // Keep rendered content alive during close animation
    useEffect(() => {
        if (expandedIndex !== null) {
            setRenderedIndex(expandedIndex);
        }
    }, [expandedIndex]);

    const handleTransitionEnd = () => {
        if (expandedIndex === null) {
            setRenderedIndex(null);
        }
    };

    useEffect(() => {
        if (expandedIndex === null) return;

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setExpandedIndex(null);
                setShowOverlay(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [expandedIndex]);

    const handleThumbnailClick = (index: number) => {
        if (expandedIndex === index) {
            setExpandedIndex(null);
            setShowOverlay(false);
        } else {
            setShowOverlay(false);
            setExpandedIndex(index);
        }
    };

    const handleExpandedClick = () => {
        if (showOverlay) {
            navigate(`/recettes/generer/sandbox?q=${encodeURIComponent(recipes[expandedIndex!].name)}`);
        } else {
            setShowOverlay(true);
        }
    };

    const isOpen = expandedIndex !== null;
    const displayIndex = renderedIndex ?? expandedIndex;

    return (
        <div ref={containerRef} className="flex flex-col items-center gap-3 mt-1 w-full">
            <div className="flex items-center justify-center gap-3">
                {recipes.map((recipe, i) => {
                    const isExpanded = expandedIndex === i;
                    const thumbSize = 'min(25vw, 25vh, 120px)';
                    return (
                        <button
                            key={i}
                            onClick={() => handleThumbnailClick(i)}
                            className="rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 ease-in-out"
                            style={{
                                width: isExpanded ? 0 : thumbSize,
                                height: isExpanded ? 0 : thumbSize,
                                opacity: isExpanded ? 0 : 1,
                                padding: 0,
                                border: 'none',
                            }}
                            tabIndex={isExpanded ? -1 : 0}
                        >
                            <img
                                src={recipe.image}
                                alt={recipe.name}
                                className="object-cover"
                                style={{ width: thumbSize, height: thumbSize }}
                                loading="lazy"
                            />
                        </button>
                    );
                })}
            </div>

            <div
                className="w-full overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                    maxHeight: isOpen ? 'calc(2 * min(25vw, 25vh, 120px) + 0.75rem)' : '0px',
                    opacity: isOpen ? 1 : 0,
                }}
                onTransitionEnd={handleTransitionEnd}
            >
                {displayIndex !== null && (
                    <button
                        onClick={handleExpandedClick}
                        className="relative aspect-square rounded-xl overflow-hidden mx-auto"
                        style={{ width: 'calc(2 * min(25vw, 25vh, 120px) + 0.75rem)' }}
                    >
                        <img
                            src={recipes[displayIndex].image}
                            alt={recipes[displayIndex].name}
                            className="w-full h-full object-cover"
                        />
                        <div
                            className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-200"
                            style={{ opacity: showOverlay ? 1 : 0 }}
                        >
                            <span className="text-[14px] font-bold text-white">
                                Generer une recette similaire
                            </span>
                            <span className="text-[12px] text-white/70 px-4">
                                {recipes[displayIndex].name}
                            </span>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}
