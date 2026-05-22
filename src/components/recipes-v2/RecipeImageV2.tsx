import { useEffect, useState, useCallback } from "react";
import BackendService from "../../api/services/BackendService";

interface RecipeImageV2Props {
    recipeUuid: string;
    isOwner: boolean;
    emoji?: string | null;
    className?: string;
}

type ImageState = "idle" | "loading" | "generating" | "no-image" | "error" | "ready";

export default function RecipeImageV2({ recipeUuid, isOwner, emoji, className = "" }: RecipeImageV2Props) {
    const [imageData, setImageData] = useState<string | null>(null);
    const [state, setState] = useState<ImageState>("idle");
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const fallbackEmoji = emoji && emoji.trim().length > 0 ? emoji : null;

    const fetchImage = useCallback(async () => {
        setState("loading");

        try {
            const email = localStorage.getItem("email");
            const token = localStorage.getItem("firebaseIdToken");

            const response = await BackendService.getRecipeV2Image(recipeUuid, email, token);

            if (response === null) {
                setState("no-image");
            } else if (response.imageData) {
                setImageData(response.imageData);
                setState("ready");
            } else {
                setState("generating");
                setTimeout(() => fetchImage(), 3000);
            }
        } catch (err) {
            setState("error");
        }
    }, [recipeUuid]);

    const handleGenerateImage = async () => {
        setState("generating");

        try {
            const email = localStorage.getItem("email") as string;
            const token = localStorage.getItem("firebaseIdToken") as string;

            if (!email || !token) {
                setState("error");
                return;
            }

            const response = await BackendService.generateRecipeV2Image(email, token, recipeUuid);

            if (response && response.imageData) {
                setImageData(response.imageData);
                setState("ready");
            } else {
                setState("error");
            }
        } catch (err) {
            console.error("Erreur lors de la génération de l'image v2:", err);
            setState("error");
        }
    };

    useEffect(() => {
        fetchImage();
    }, [fetchImage]);

    if (state === "idle" || state === "loading") {
        return (
            <div className={`${className} flex justify-center`}>
                <div className="relative w-1/2 aspect-square rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        {fallbackEmoji ? (
                            <span className="text-[6rem] leading-none select-none" aria-hidden>{fallbackEmoji}</span>
                        ) : (
                            <div className="text-center">
                                <div className="animate-spin w-8 h-8 border-4 border-cout-base border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="text-text-secondary text-sm">
                                    Chargement...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (state === "generating") {
        return (
            <div className={`${className} flex justify-center`}>
                <div className="relative w-1/2 aspect-square rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        {fallbackEmoji ? (
                            <span className="text-[6rem] leading-none select-none" aria-hidden>{fallbackEmoji}</span>
                        ) : (
                            <div className="animate-spin w-8 h-8 border-4 border-cout-base border-t-transparent rounded-full"></div>
                        )}
                        <p className="text-text-secondary text-xs bg-primary/80 backdrop-blur-md px-3 py-1 rounded-full border border-border-color flex items-center gap-2">
                            <span className="inline-block w-3 h-3 border-2 border-cout-base border-t-transparent rounded-full animate-spin" />
                            Création du visuel...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (state === "no-image") {
        return (
            <div className={`${className} flex justify-center`}>
                <div className="relative w-1/2 aspect-square rounded-lg bg-secondary border-2 border-dashed border-border-color flex items-center justify-center overflow-hidden">
                    {fallbackEmoji && (
                        <span className="absolute inset-0 flex items-center justify-center text-[6rem] leading-none select-none opacity-80" aria-hidden>{fallbackEmoji}</span>
                    )}
                    <div className="relative text-center p-4">
                        {!fallbackEmoji && (
                            <p className="text-text-secondary mb-4">
                                Aucune image pour cette recette
                            </p>
                        )}
                        {isOwner ? (
                            <button
                                onClick={handleGenerateImage}
                                className="px-4 py-2 bg-cout-base text-white rounded-lg hover:bg-cout-base/80 transition-colors font-medium shadow"
                            >
                                Générer le visuel
                            </button>
                        ) : !fallbackEmoji ? (
                            <p className="text-text-secondary text-sm italic">
                                Le propriétaire de la recette peut générer l'image
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }

    if (state === "error") {
        return (
            <div className={`${className} flex justify-center`}>
                <div className="w-1/2 aspect-square rounded-lg bg-secondary flex items-center justify-center">
                    <div className="text-center text-text-secondary">
                        <p>Impossible de charger l'image</p>
                        <button
                            onClick={fetchImage}
                            className="mt-2 text-cout-base hover:underline text-sm"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!imageData) {
        return null;
    }

    return (
        <div className={`${className} flex justify-center`}>
            <img
                data-recipe-hero-image
                src={`data:image/png;base64,${imageData}`}
                alt="Illustration du plat"
                onClick={() => setIsExpanded(!isExpanded)}
                className={`rounded-lg shadow-md cursor-pointer transition-all duration-300 ease-in-out ${isExpanded
                    ? "w-full hover:scale-[0.98]"
                    : "w-1/2 hover:scale-105"
                    }`}
            />
        </div>
    );
}
