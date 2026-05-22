import { Capacitor } from "@capacitor/core";
import BackendService from "../../api/services/BackendService";
import ShareButton from "../common/ShareButton";

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

    const shareUrl = Capacitor.isNativePlatform()
        ? `https://plan-appetit.fr${window.location.pathname}?share`
        : `${window.location.origin}${window.location.pathname}?share`;

    const title = recipeName || "Recette Plan Appetit";

    return (
        <ShareButton
            url={shareUrl}
            title={title}
            text={`Découvrez cette recette : ${title}`}
            dialogTitle="Partager cette recette"
            onShared={trackExport}
            fullWidth={fullWidth}
            className={className}
        />
    );
}
