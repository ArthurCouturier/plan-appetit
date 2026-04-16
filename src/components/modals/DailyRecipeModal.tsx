import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import Modal from "./Modal";
import DailyRecipeService, { DailyRecipeDTO } from "../../api/services/DailyRecipeService";
import NotificationService from "../../api/services/NotificationService";
import { TrackingService } from "../../api/tracking/TrackingService";

interface DailyRecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DailyRecipeModal({ isOpen, onClose }: DailyRecipeModalProps) {
    const navigate = useNavigate();
    const [data, setData] = useState<DailyRecipeDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [showNotifPrompt, setShowNotifPrompt] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setShowNotifPrompt(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                if (Capacitor.isNativePlatform()) {
                    const status = await FirebaseMessaging.checkPermissions();
                    if (status.receive !== "granted") {
                        setShowNotifPrompt(true);
                    }
                } else if ("Notification" in window && Notification.permission !== "granted") {
                    setShowNotifPrompt(true);
                }
            } catch { /* ignore */ }
        }, 2000);

        return () => clearTimeout(timer);
    }, [isOpen]);

    const handleEnableNotifications = async () => {
        const email = localStorage.getItem("email") || "";
        const token = localStorage.getItem("firebaseIdToken") || "";
        if (email && token) {
            await NotificationService.initializeNotifications(email, token, "daily_recipe_modal");
        }
        setShowNotifPrompt(false);
    };

    useEffect(() => {
        if (!isOpen) return;

        setLoading(true);
        setError(false);

        DailyRecipeService.getDailyRecipes()
            .then((result) => {
                setData(result);
                if (result) {
                    TrackingService.promptATTIfNeeded();
                } else {
                    setError(true);
                }
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [isOpen]);

    const handleRecipeClick = (uuid: string) => {
        onClose();
        navigate(`/recettes/${uuid}?share`);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Recettes du jour" size="lg">
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-4 border-border-color border-t-cout-purple rounded-full animate-spin" />
                </div>
            )}

            {error && !loading && (
                <p className="text-center text-text-secondary py-8">
                    Aucune recette du jour disponible pour le moment.
                </p>
            )}

            {data && !loading && (
                <div className="flex flex-col gap-4">
                    <RecipeChoice
                        label="Recette simple"
                        name={data.quickRecipe.name}
                        imageData={data.quickRecipe.imageData}
                        onClick={() => handleRecipeClick(data.quickRecipe.uuid)}
                    />
                    <RecipeChoice
                        label="Recette experte"
                        name={data.expertRecipe.name}
                        imageData={data.expertRecipe.imageData}
                        onClick={() => handleRecipeClick(data.expertRecipe.uuid)}
                    />

                    {showNotifPrompt && (
                        <div className="mt-2 p-3 rounded-xl bg-cout-yellow/10 border border-cout-yellow/30">
                            <p className="text-sm text-text-primary mb-2">
                                Activez les notifications pour ne plus rater les recettes du jour !
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleEnableNotifications}
                                    className="flex-1 px-3 py-2 bg-cout-yellow text-cout-purple text-sm font-semibold rounded-lg"
                                >
                                    Activer
                                </button>
                                <button
                                    onClick={() => setShowNotifPrompt(false)}
                                    className="px-3 py-2 text-text-secondary text-sm rounded-lg"
                                >
                                    Plus tard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}

function RecipeChoice({
    label,
    name,
    imageData,
    onClick,
}: {
    label: string;
    name: string;
    imageData: string | null;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-4 w-full p-3 rounded-xl border border-border-color bg-secondary hover:bg-tertiary transition-all duration-200 hover:shadow-md active:scale-[0.98] text-left"
        >
            <div className="w-20 h-20 min-w-[5rem] rounded-lg overflow-hidden bg-border-color">
                {imageData ? (
                    <img
                        src={`data:image/png;base64,${imageData}`}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                        🍽️
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-semibold text-cout-purple uppercase tracking-wide">
                    {label}
                </span>
                <span className="text-base font-medium text-text-primary truncate">
                    {name}
                </span>
            </div>
        </button>
    );
}
