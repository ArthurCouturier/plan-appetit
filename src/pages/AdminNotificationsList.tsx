import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../api/interfaces/users/UserInterface";
import AdminService, { BroadcastNotificationDTO } from "../api/services/AdminService";

export default function AdminNotificationsList() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<BroadcastNotificationDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
        return <Navigate to="/" replace />;
    }

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await AdminService.getAllBroadcastNotifications();
            setNotifications(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleCancel = async (id: string) => {
        setCancelling(true);
        try {
            await AdminService.cancelBroadcastNotification(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, type: "BROADCAST_CANCEL" } : n)
            );
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setCancelling(false);
            setConfirmId(null);
        }
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("fr-FR", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-20 space-y-6">
            <div className="bg-primary rounded-xl p-6 shadow-md border border-border-color">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-text-primary">Broadcasts envoyes</h2>
                    <button
                        onClick={fetchNotifications}
                        disabled={loading}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border-color hover:bg-thirdary transition-colors disabled:opacity-50"
                    >
                        {loading ? "..." : "Rafraichir"}
                    </button>
                </div>

                {error && (
                    <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {loading && notifications.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : notifications.length === 0 ? (
                    <p className="text-center text-text-secondary py-8">Aucun broadcast envoye</p>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notif) => {
                            const isCancelled = notif.type === "BROADCAST_CANCEL";
                            return (
                                <div
                                    key={notif.id}
                                    className={`border rounded-lg p-4 ${
                                        isCancelled
                                            ? "border-red-300 bg-red-50/50 opacity-60"
                                            : "border-border-color bg-secondary"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-text-primary text-sm truncate">
                                                    {notif.title}
                                                </p>
                                                {isCancelled && (
                                                    <span className="shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-200 text-red-700">
                                                        ANNULEE
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-text-secondary line-clamp-2">{notif.body}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                                                    {notif.segment || "Tous"}
                                                </span>
                                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                                                    {notif.iconType}
                                                </span>
                                                {notif.actionUrl && (
                                                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                                                        {notif.actionUrl}
                                                    </span>
                                                )}
                                                <span className="px-2 py-0.5 text-[10px] rounded-full bg-thirdary text-text-secondary">
                                                    {formatDate(notif.createdAt)}
                                                </span>
                                                {notif.expiresAt && (
                                                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-yellow-100 text-yellow-800">
                                                        Expire {formatDate(notif.expiresAt)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {!isCancelled && (
                                            <div className="shrink-0">
                                                {confirmId === notif.id ? (
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            onClick={() => handleCancel(notif.id)}
                                                            disabled={cancelling}
                                                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                                                        >
                                                            {cancelling ? "..." : "Confirmer"}
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmId(null)}
                                                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary border border-border-color hover:bg-thirdary transition-colors"
                                                        >
                                                            Annuler
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setConfirmId(notif.id)}
                                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                                                    >
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
