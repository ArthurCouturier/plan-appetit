import { useState } from "react";
import { ArrowUpOnSquareIcon } from "@heroicons/react/24/solid";
import { Capacitor } from "@capacitor/core";
import { Share } from "@capacitor/share";
import BackendService from "../../api/services/BackendService";

interface RecipeShareButtonV2Props {
    recipeName: string;
    fullWidth?: boolean;
    className?: string;
}

export default function RecipeShareButtonV2({
    recipeName,
    fullWidth = false,
    className = "",
}: RecipeShareButtonV2Props) {
    const [isSharing, setIsSharing] = useState(false);

    const trackExport = async () => {
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("firebaseIdToken");
        if (email && token) {
            try {
                await BackendService.trackRecipeExport(email, token);
            } catch (error) {
                console.error("Erreur lors du tracking export:", error);
            }
        }
    };

    const handleShare = async () => {
        if (isSharing) return;
        setIsSharing(true);

        const shareUrl = Capacitor.isNativePlatform()
            ? `https://plan-appetit.fr${window.location.pathname}?share`
            : `${window.location.origin}${window.location.pathname}?share`;

        try {
            if (Capacitor.isNativePlatform()) {
                await Share.share({
                    title: recipeName || "Recette Plan Appetit",
                    url: shareUrl,
                    dialogTitle: "Partager cette recette",
                });
                await trackExport();
            } else if (navigator.share) {
                await navigator.share({
                    title: recipeName || "Recette Plan Appetit",
                    text: `Découvrez cette recette : ${recipeName}`,
                    url: shareUrl,
                });
                await trackExport();
            } else {
                await navigator.clipboard.writeText(shareUrl);
                alert("Lien copié dans le presse-papier !");
                await trackExport();
            }
        } catch (error) {
            const msg = (error as Error).message || "";
            if (msg !== "Share canceled" && (error as Error).name !== "AbortError") {
                console.error("Erreur lors du partage:", error);
            }
        } finally {
            setIsSharing(false);
        }
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            onClick={handleShare}
            disabled={isSharing}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cout-base to-cout-purple text-white font-semibold rounded-lg hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 ${widthClass} ${className}`}
        >
            <ArrowUpOnSquareIcon className="w-5 h-5" />
            <span>Partager</span>
        </button>
    );
}
