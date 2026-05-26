import { forwardRef } from "react";
import { useRecipeImageVisible } from "../../api/hooks/useRecipeImageBatch";

interface RecipeImageThumbnailProps {
    recipeUuid: string;
    recipeName: string;
    fallbackEmoji?: string | null;
    className?: string;
    fallbackEmojiClassName?: string;
}

/**
 * Vignette d'une recette v2 avec gestion complète des états :
 * - skeleton shimmer pendant le chargement (lazy via IntersectionObserver + batch)
 * - <img> base64 quand l'image est dispo
 * - fallback emoji + bg quand pas d'image
 *
 * Le ref forward cible le <img> rendu (utile pour les animations fly-to type RecipeCard).
 * Le hook useRecipeImageVisible attache son ref sur le wrapper interne pour détecter
 * la visibilité et déclencher le batch fetch.
 *
 * Pour le rendu full-page avec bouton de génération, voir RecipeImage.tsx.
 */
const RecipeImageThumbnail = forwardRef<HTMLImageElement, RecipeImageThumbnailProps>(
    (
        {
            recipeUuid,
            recipeName,
            fallbackEmoji = null,
            className = "",
            fallbackEmojiClassName = "text-2xl",
        },
        imgRef,
    ) => {
        const { ref: visibilityRef, data: imageData } = useRecipeImageVisible(recipeUuid);
        const isLoading = imageData === undefined;

        return (
            <div ref={visibilityRef} className={`overflow-hidden ${className}`}>
                {isLoading ? (
                    <div className="w-full h-full bg-gradient-to-r from-border-color via-secondary to-border-color animate-shimmer bg-[length:200%_100%]" />
                ) : imageData ? (
                    <img
                        ref={imgRef}
                        src={`data:image/png;base64,${imageData}`}
                        alt={recipeName}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                ) : (
                    <div className="w-full h-full bg-border-color flex items-center justify-center">
                        <span className={fallbackEmojiClassName}>{fallbackEmoji ?? "🍽️"}</span>
                    </div>
                )}
            </div>
        );
    },
);

RecipeImageThumbnail.displayName = "RecipeImageThumbnail";

export default RecipeImageThumbnail;
