import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { useRegenerateRitualDaily, useRitualDaily } from "../api/hooks/useRitualDaily";
import {
    MealType,
    REGENERATION_REASON_MAX_LENGTH,
    RitualDailyInterface,
} from "../api/interfaces/ritual/RitualDailyInterface";
import RecipeCard from "../components/cards/RecipeCard";
import RecipeSummaryInterface from "../api/interfaces/recipes/RecipeSummaryInterface";
import Modal from "../components/modals/Modal";
import NotificationService from "../api/services/NotificationService";
import { errorHaptic } from "../haptics/error";
import { lightHaptic } from "../haptics/light";

export default function RitualDailyPage() {
    return (
        <div
            className="min-h-screen bg-primary px-4 pb-12"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
        >
            <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-text-primary text-center mb-2">
                    Ton ritual du jour
                </h1>
                <p className="text-text-secondary text-center mb-6">
                    Deux recettes pensées pour toi, midi et soir.
                </p>
                <NotifPermissionPrompt />
                <div className="grid grid-cols-2 gap-4">
                    <MealSlot mealType="LUNCH" label="Ce midi" />
                    <MealSlot mealType="DINNER" label="Ce soir" />
                </div>
                <Link
                    to="/ritual/calendar"
                    className="mt-8 block text-center px-4 py-3 rounded-full bg-secondary border border-border-color text-text-primary font-semibold"
                >
                    📅 Voir mon journal des repas
                </Link>
                <Link
                    to="/ritual/shopping"
                    className="mt-2 block text-center px-4 py-3 rounded-full bg-secondary border border-border-color text-text-primary font-semibold"
                >
                    🛒 Ma liste de courses
                </Link>
                <Link
                    to="/ritual/settings"
                    className="mt-2 block text-center px-4 py-2 text-text-secondary text-sm"
                >
                    ⚙️ Réglages des notifications
                </Link>
            </div>
        </div>
    );
}

function NotifPermissionPrompt() {
    const [granted, setGranted] = useState<boolean | null>(null);
    const [enabling, setEnabling] = useState(false);

    const checkPermission = async () => {
        try {
            if (Capacitor.isNativePlatform()) {
                const status = await FirebaseMessaging.checkPermissions();
                setGranted(status.receive === "granted");
            } else if ("Notification" in window) {
                setGranted(Notification.permission === "granted");
            } else {
                setGranted(true);
            }
        } catch {
            setGranted(true);
        }
    };

    useEffect(() => {
        checkPermission();
    }, []);

    const handleEnable = async () => {
        const email = localStorage.getItem("email") || "";
        const token = localStorage.getItem("firebaseIdToken") || "";
        if (!email || !token) return;
        setEnabling(true);
        try {
            await NotificationService.initializeNotifications(email, token, "ritual_page");
            await checkPermission();
            lightHaptic();
        } catch {
            errorHaptic();
        } finally {
            setEnabling(false);
        }
    };

    if (granted === null || granted) return null;

    return (
        <div className="mb-6 p-4 rounded-2xl bg-cout-yellow/10 border border-cout-yellow/30">
            <p className="text-sm text-text-primary mb-3">
                🔔 Active les notifications pour recevoir « Qu'est-ce qu'on mange ? » à midi et le soir.
            </p>
            <button
                type="button"
                onClick={handleEnable}
                disabled={enabling}
                className="w-full px-4 py-2.5 rounded-full bg-cout-yellow text-cout-purple font-bold text-sm disabled:opacity-50"
            >
                {enabling ? "Activation..." : "Activer les notifications"}
            </button>
        </div>
    );
}

function MealSlot({ mealType, label }: { mealType: MealType; label: string }) {
    const query = useRitualDaily(mealType);
    const regenerate = useRegenerateRitualDaily();
    const [reasonModalOpen, setReasonModalOpen] = useState(false);

    const handleConfirmRegenerate = (reason: string) => {
        regenerate.mutate(
            { mealType, reason: reason.trim() || undefined },
            {
                onError: () => errorHaptic(),
                onSuccess: () => {
                    lightHaptic();
                    setReasonModalOpen(false);
                },
            },
        );
    };

    return (
        <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-text-secondary text-center uppercase tracking-wider">
                {label}
            </p>
            <div className="min-h-[200px]">
                {query.isLoading && <LoadingState />}
                {query.isError && (
                    <ErrorState
                        message={query.error?.message ?? "Erreur inattendue."}
                        onRetry={() => query.refetch()}
                    />
                )}
                {!query.isLoading && !query.isError && query.data && (
                    <RecipeCard recipe={toRecipeSummary(query.data)} />
                )}
            </div>
            <button
                type="button"
                onClick={() => { setReasonModalOpen(true); lightHaptic(); }}
                disabled={regenerate.isPending || query.isLoading || !query.data}
                className="px-3 py-2 rounded-full bg-secondary border border-border-color text-text-primary text-xs font-semibold disabled:opacity-50"
            >
                {regenerate.isPending ? "..." : "↻ Autre chose"}
            </button>
            {regenerate.isError && (
                <p className="text-xs text-cancel-1 text-center">
                    {regenerate.error?.message ?? "Erreur."}
                </p>
            )}
            {reasonModalOpen && (
                <RegenerationReasonModal
                    label={label}
                    currentRecipeName={query.data?.recipeName ?? ""}
                    onCancel={() => setReasonModalOpen(false)}
                    onConfirm={handleConfirmRegenerate}
                    isSubmitting={regenerate.isPending}
                    error={regenerate.error?.message ?? null}
                />
            )}
        </div>
    );
}

function RegenerationReasonModal({
    label,
    currentRecipeName,
    onCancel,
    onConfirm,
    isSubmitting,
    error,
}: {
    label: string;
    currentRecipeName: string;
    onCancel: () => void;
    onConfirm: (reason: string) => void;
    isSubmitting: boolean;
    error: string | null;
}) {
    const [reason, setReason] = useState("");
    return (
        <Modal isOpen onClose={onCancel} title={`Changer la recette ${label.toLowerCase()}`} size="sm">
            <div className="p-6">
                <p className="text-text-secondary text-sm mb-3">
                    On va remplacer <span className="font-semibold text-text-primary">{currentRecipeName || "ta recette"}</span>.
                    Dis-nous ce qui ne te plaît pas, on en proposera une vraiment différente.
                </p>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                    Pourquoi tu veux autre chose ? (optionnel)
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={REGENERATION_REASON_MAX_LENGTH}
                    rows={3}
                    placeholder="ex: pas envie de pâtes, trop long à faire, je n'aime pas le poisson..."
                    className="w-full px-4 py-3 bg-secondary border border-border-color rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-cout-yellow resize-none"
                />
                <div className="flex justify-between items-center mt-1 mb-4">
                    <span className="text-xs text-text-secondary">{reason.length} / {REGENERATION_REASON_MAX_LENGTH}</span>
                </div>
                {error && <p className="text-xs text-cancel-1 mb-2">{error}</p>}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 rounded-full bg-secondary border border-border-color text-text-primary font-semibold disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(reason)}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                    >
                        {isSubmitting ? "Génération..." : "Régénérer"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function toRecipeSummary(d: RitualDailyInterface): RecipeSummaryInterface {
    return {
        uuid: d.recipeUuid,
        name: d.recipeName,
        covers: d.covers,
        buyPrice: d.buyPrice,
        isPublic: d.isPublic,
        displayOrder: 0,
        totalTimeMin: d.totalTimeMin,
        restTimeMin: d.restTimeMin,
        creationDate: d.creationDate,
    };
}

function LoadingState() {
    return (
        <div className="bg-secondary border border-border-color rounded-2xl p-6 text-center h-full flex flex-col justify-center">
            <div className="w-8 h-8 border-2 border-cout-purple border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-text-secondary text-xs">On prépare ta recette...</p>
        </div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="bg-secondary border border-cancel-1/30 rounded-2xl p-4 text-center h-full flex flex-col justify-center">
            <p className="text-text-primary text-xs mb-3">{message}</p>
            <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 rounded-full bg-cout-yellow text-cout-purple text-xs font-bold"
            >
                Réessayer
            </button>
        </div>
    );
}
