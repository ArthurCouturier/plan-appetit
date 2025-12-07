import { useState, useEffect } from "react";
import { BellIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import NotificationService from "../../api/services/NotificationService";
import { Capacitor } from "@capacitor/core";

interface NotificationSettingsProps {
    isPremium: boolean;
}

export default function NotificationSettings({ isPremium }: NotificationSettingsProps) {
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkNotificationStatus();
    }, []);

    const checkNotificationStatus = async () => {
        if (Capacitor.isNativePlatform()) {
            // Pour les apps natives, on considère que c'est géré par le système
            setNotificationsEnabled(true);
            return;
        }

        if (!("Notification" in window)) {
            setNotificationsEnabled(false);
            return;
        }

        setNotificationsEnabled(Notification.permission === "granted");
    };

    const handleEnableNotifications = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('firebaseIdToken');
            const email = localStorage.getItem('email');

            if (!token || !email) {
                throw new Error('Non authentifié');
            }

            const success = await NotificationService.initializeNotifications(email, token);

            if (success) {
                setNotificationsEnabled(true);
            } else {
                setError("Impossible d'activer les notifications. Vérifiez les paramètres de votre navigateur.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    // Ne pas afficher si pas premium
    if (!isPremium) {
        return null;
    }

    // Sur les plateformes natives, afficher juste un indicateur
    if (Capacitor.isNativePlatform()) {
        return (
            <div className="bg-primary rounded-xl p-6 shadow-lg border border-border-color">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BellIcon className="w-5 h-5 text-cout-base" />
                        <span className="text-base font-bold text-text-primary">Notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-green-500 text-sm font-semibold">Activées</span>
                    </div>
                </div>
                <p className="text-text-secondary text-sm mt-2">
                    Gérez les notifications dans les paramètres de votre appareil.
                </p>
            </div>
        );
    }

    // Sur le web
    return (
        <div className="bg-primary rounded-xl p-6 shadow-lg border border-border-color">
            <div className="flex items-center gap-3 mb-4">
                <BellIcon className="w-5 h-5 text-cout-base" />
                <h3 className="text-lg font-bold text-text-primary">Notifications</h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {notificationsEnabled === null ? (
                <div className="animate-pulse">
                    <div className="h-4 bg-secondary rounded w-3/4"></div>
                </div>
            ) : notificationsEnabled ? (
                <div className="flex items-center justify-between">
                    <p className="text-text-secondary text-sm">
                        Vous recevrez des rappels avant la fin de votre abonnement.
                    </p>
                    <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        <span className="text-green-500 text-sm font-semibold">Activées</span>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-text-secondary text-sm">
                        Activez les notifications pour recevoir des rappels importants concernant votre abonnement Premium.
                    </p>
                    <button
                        onClick={handleEnableNotifications}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cout-base text-white font-semibold rounded-xl hover:bg-cout-purple transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Activation...
                            </>
                        ) : (
                            <>
                                <BellIcon className="w-5 h-5" />
                                Activer les notifications
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
