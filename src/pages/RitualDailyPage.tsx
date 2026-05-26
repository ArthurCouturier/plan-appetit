import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { useRegenerateRitualDaily, useRitualDaily } from "../api/hooks/useRitualDaily";
import {
    MealType,
    REGENERATION_REASON_MAX_LENGTH,
    RegenerationMode,
} from "../api/interfaces/ritual/RitualDailyInterface";
import RecipeCard from "../components/cards/RecipeCard";
import { ritualDailyToRecipeSummary } from "../api/adapters/ritualDailyAdapter";
import Modal from "../components/modals/Modal";
import NotificationService from "../api/services/NotificationService";
import RitualMonthCalendar from "../components/ritual/RitualMonthCalendar";
import { errorHaptic } from "../haptics/error";
import { lightHaptic } from "../haptics/light";

export default function RitualDailyPage() {
    return (
        <div className="min-h-screen bg-bg-color px-4 pb-12 mobile-content-with-header">
            <div className="max-w-md mx-auto">
                <h1 className="text-3xl font-bold text-text-primary text-center mb-4">
                    Mes recettes du jour
                </h1>
                <NotifPermissionPrompt />
                <div className="grid grid-cols-2 gap-4">
                    <MealSlot mealType="LUNCH" label="Ce midi" />
                    <MealSlot mealType="DINNER" label="Ce soir" />
                </div>
                <div className="mt-8">
                    <h2 className="text-base font-semibold text-text-primary mb-1">
                        📅 Mon historique de repas
                    </h2>
                    <JournalInfoLink />
                    <div className="mt-3">
                        <RitualMonthCalendar />
                    </div>
                </div>
                <Link
                    to="/ritual/settings"
                    className="mt-8 w-full px-4 py-2.5 rounded-full bg-cout-yellow text-cout-purple font-bold text-sm flex items-center justify-center gap-2"
                >
                    <Cog6ToothIcon className="w-4 h-4" />
                    Réglages
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
            <p className="text-sm text-text-primary mb-3">
                Ça nous permet ensuite de comprendre tes habitudes pour te proposer des repas toujours plus adaptés.
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
    const [flemmeModalOpen, setFlemmeModalOpen] = useState(false);

    const handleConfirmRegenerate = (reason: string, mode: RegenerationMode = "STANDARD") => {
        regenerate.mutate(
            {
                mealType,
                reason: reason.trim() || undefined,
                mode,
            },
            {
                onError: () => errorHaptic(),
                onSuccess: () => {
                    lightHaptic();
                    setReasonModalOpen(false);
                },
            },
        );
    };

    const handleConfirmFlemme = () => {
        regenerate.mutate(
            { mealType, mode: "FLEMME" },
            {
                onError: () => errorHaptic(),
                onSuccess: () => {
                    lightHaptic();
                    setFlemmeModalOpen(false);
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
                    <RecipeCard
                        key={query.data.recipeUuid}
                        recipe={ritualDailyToRecipeSummary(query.data)}
                    />
                )}
            </div>
            {query.data?.explanation && (
                <WhyThisDishLink explanation={query.data.explanation} />
            )}
            <button
                type="button"
                onClick={() => { setReasonModalOpen(true); lightHaptic(); }}
                disabled={regenerate.isPending || query.isLoading || !query.data}
                className="px-3 py-2 rounded-full bg-secondary border border-border-color text-text-primary text-xs font-semibold disabled:opacity-50"
            >
                {regenerate.isPending ? "..." : "↻ Modifier"}
            </button>
            <button
                type="button"
                onClick={() => { setFlemmeModalOpen(true); lightHaptic(); }}
                disabled={regenerate.isPending || query.isLoading || !query.data}
                className="px-3 py-2 rounded-full bg-secondary border border-border-color text-text-primary text-xs font-semibold disabled:opacity-50"
            >
                💤 Mode flemme
            </button>
            {regenerate.isError && (
                <p className="text-xs text-cancel-1 text-center">
                    {regenerate.error?.message ?? "Erreur."}
                </p>
            )}
            {reasonModalOpen && (
                <RegenerationReasonModal
                    label={label}
                    onCancel={() => setReasonModalOpen(false)}
                    onConfirm={handleConfirmRegenerate}
                    isSubmitting={regenerate.isPending}
                    error={regenerate.error?.message ?? null}
                />
            )}
            {flemmeModalOpen && (
                <FlemmeConfirmModal
                    label={label}
                    onCancel={() => setFlemmeModalOpen(false)}
                    onConfirm={handleConfirmFlemme}
                    isSubmitting={regenerate.isPending}
                    error={regenerate.error?.message ?? null}
                />
            )}
        </div>
    );
}

function RegenerationReasonModal({
    label,
    onCancel,
    onConfirm,
    isSubmitting,
    error,
}: {
    label: string;
    onCancel: () => void;
    onConfirm: (reason: string, mode?: RegenerationMode) => void;
    isSubmitting: boolean;
    error: string | null;
}) {
    const [reason, setReason] = useState("");
    return (
        <Modal isOpen onClose={onCancel} title={`Changer la recette ${label.toLowerCase()}`} size="sm">
            <div>
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
                {error && <p className="text-xs text-cancel-1 mb-2">{error}</p>}
                <div className="mt-2 flex gap-2">
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
                        onClick={() => onConfirm(reason, "STANDARD")}
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

function FlemmeConfirmModal({
    label,
    onCancel,
    onConfirm,
    isSubmitting,
    error,
}: {
    label: string;
    onCancel: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
    error: string | null;
}) {
    return (
        <Modal isOpen onClose={onCancel} title={`Mode flemme ${label.toLowerCase()}`} size="sm">
            <div className="px-2 text-md text-text-primary leading-relaxed space-y-3 text-justify indent-1 font-semibold">
                <p>
                    On te propose une recette <span className="font-semibold">≤ 10 min</span>,
                    calée sur tes habitudes des 30 derniers jours.
                </p>
                <p>
                    Parfait quand tu n'as pas envie de réfléchir : un plat simple, dans ton style,
                    mais équilibré et si possible avec des produit de saison.
                </p>
                {error && <p className="text-xs text-cancel-1 mb-2">{error}</p>}
                <div className="mt-4 flex gap-2">
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
                        onClick={onConfirm}
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-3 rounded-full bg-cout-yellow text-cout-purple font-bold disabled:opacity-50"
                    >
                        {isSubmitting ? "Génération..." : "Vas-y"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function WhyThisDishLink({ explanation }: { explanation: string }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                type="button"
                onClick={() => { setOpen(true); lightHaptic(); }}
                className="text-xs text-text-secondary underline underline-offset-2 text-center"
            >
                Pourquoi ce plat ?
            </button>
            {open && (
                <Modal isOpen onClose={() => setOpen(false)} title="Pourquoi ce plat ?" size="sm">
                    <div className="px-2 py-4 text-md text-text-primary leading-relaxed space-y-3 text-justify indent-1 font-semibold">
                        <p>{explanation}</p>
                    </div>
                </Modal>
            )}
        </>
    );
}

function JournalInfoLink() {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                type="button"
                onClick={() => { setOpen(true); lightHaptic(); }}
                className="text-xs text-text-secondary underline underline-offset-2"
            >
                En savoir plus...
            </button>
            {open && (
                <Modal isOpen onClose={() => setOpen(false)} title="Pourquoi ton historique compte" size="sm">
                    <div className="px-2 py-4 text-md text-text-primary leading-relaxed space-y-3 text-justify indent-1 font-semibold">
                        <p>
                            On utilise ce que tu notes dans ton historique de repas pour comprendre
                            tes habitudes: ce que tu cuisines souvent, les saveurs qui reviennent,
                            les moments où tu as plus ou moins de temps etc...
                        </p>
                        <p className="py-4">
                            Plus tu remplis ton journal, plus on peut te proposer des recettes vraiment
                            sur mesure, en adéquation avec ce que tu aimes et ton rythme.
                        </p>
                        <p>
                            On prend ensuite en compte ce que tu as l'habitude de manger, tes derniers
                            repas, pour te proposer une recette rapide et surtout équilibrée, sans
                            bousculer tes habitudes.
                        </p>
                    </div>
                </Modal>
            )}
        </>
    );
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
