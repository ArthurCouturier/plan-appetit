import { useEffect, useState, useCallback } from "react";
import BackendService from "../../api/services/BackendService";

interface RecipeImageProps {
    recipeUuid: string;
    isGenerated: boolean;
    className?: string;
}

type ImageState = "idle" | "loading" | "generating" | "no-image" | "error" | "ready";

export default function RecipeImage({ recipeUuid, isGenerated, className = "" }: RecipeImageProps) {

    const [imageData, setImageData] = useState<string | null>(null);
    const [state, setState] = useState<ImageState>("idle");
    const [isExpanded, setIsExpanded] = useState<boolean>(false);


    const fetchImage = useCallback(async () => {
        setState("loading");

        try {
            const email = localStorage.getItem("email") as string;
            const token = localStorage.getItem("firebaseIdToken") as string;

            if (!email || !token) {
                setState("error");
                return;
            }

            const response = await BackendService.getRecipeImage(email, token, recipeUuid);

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

            const response = await BackendService.generateRecipeImage(email, token, recipeUuid);

            if (response && response.imageData) {
                setImageData(response.imageData);
                setState("ready");
            } else {
                setState("error");
            }
        } catch (err) {
            console.error("Erreur lors de la génération de l'image:", err);
            setState("error");
        }
    };

    useEffect(() => {
        if (!isGenerated) {
            return;
        }
        fetchImage();
    }, [recipeUuid, isGenerated, fetchImage]);

    if (!isGenerated) {
        return null;
    }

    if (state === "idle" || state === "loading") {
        return (
            <div className={`${className} flex justify-center`}>
                <div className="relative w-1/2 aspect-square rounded-lg overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-cout-base border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-text-secondary text-sm">
                                Chargement...
                            </p>
                        </div>
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
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin w-8 h-8 border-4 border-cout-base border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-white text-sm">
                                Génération du visuel en cours...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (state === "no-image") {
        return (
            <div className={`${className} flex justify-center`}>
                <div className="w-1/2 aspect-square rounded-lg bg-secondary border-2 border-dashed border-border-color flex items-center justify-center">
                    <div className="text-center p-4">
                        <p className="text-text-secondary mb-4">
                            Aucune image pour cette recette
                        </p>
                        <button
                            onClick={handleGenerateImage}
                            className="px-4 py-2 bg-cout-base text-white rounded-lg hover:bg-cout-base/80 transition-colors font-medium"
                        >
                            Générer le visuel
                        </button>
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
