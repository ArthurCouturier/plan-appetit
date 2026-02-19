import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../api/hooks/useAuth";
import { hasRoleLevel, UserRole } from "../api/interfaces/users/UserInterface";
import Header from "../components/global/Header";
import AdminService, { SchedulerStatusDTO } from "../api/services/AdminService";

export default function AdminBatchs() {
    const { user } = useAuth();
    const [schedulers, setSchedulers] = useState<SchedulerStatusDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    if (!user || !hasRoleLevel(user.role, UserRole.ADMIN)) {
        return <Navigate to="/" replace />;
    }

    useEffect(() => {
        AdminService.getSchedulers()
            .then(setSchedulers)
            .catch((e) => setError(e instanceof Error ? e.message : "Erreur"))
            .finally(() => setLoading(false));
    }, []);

    const handleToggle = async (name: string) => {
        try {
            const updated = await AdminService.toggleScheduler(name);
            setSchedulers((prev) =>
                prev.map((s) => (s.name === updated.name ? updated : s))
            );
        } catch (e) {
            setError(e instanceof Error ? e.message : "Erreur");
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            <Header back pageName="Batchs" />

            {loading && (
                <div className="flex justify-center py-12">
                    <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
            )}

            {!loading && (
                <div className="space-y-4">
                    {schedulers.map((scheduler) => (
                        <BatchCard
                            key={scheduler.name}
                            scheduler={scheduler}
                            onToggle={() => handleToggle(scheduler.name)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function BatchCard({ scheduler, onToggle }: {
    scheduler: SchedulerStatusDTO;
    onToggle: () => void;
}) {
    const [triggering, setTriggering] = useState(false);
    const [triggerResult, setTriggerResult] = useState<string | null>(null);
    const [triggerError, setTriggerError] = useState<string | null>(null);

    const handleTrigger = async () => {
        setTriggering(true);
        setTriggerResult(null);
        setTriggerError(null);

        try {
            await AdminService.triggerScheduler(scheduler.name);
            setTriggerResult("Batch exécuté avec succès");
        } catch (e) {
            setTriggerError(e instanceof Error ? e.message : "Erreur inconnue");
        } finally {
            setTriggering(false);
        }
    };

    return (
        <div className="bg-primary rounded-xl p-5 shadow-md border border-border-color">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-semibold text-text-primary">{scheduler.name}</h3>
                    <p className="text-sm text-text-secondary mt-1">{scheduler.description}</p>
                </div>

                <button
                    onClick={onToggle}
                    className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-300 ${
                        scheduler.enabled ? "bg-green-500" : "bg-gray-400"
                    }`}
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${
                            scheduler.enabled ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <button
                    onClick={handleTrigger}
                    disabled={triggering}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {triggering ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            En cours...
                        </span>
                    ) : (
                        "Lancer manuellement"
                    )}
                </button>

                <span className={`text-xs font-medium ${scheduler.enabled ? "text-green-600 dark:text-green-400" : "text-gray-500"}`}>
                    {scheduler.enabled ? "Actif" : "Désactivé"}
                </span>
            </div>

            {triggerResult && (
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">{triggerResult}</p>
                </div>
            )}

            {triggerError && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">{triggerError}</p>
                </div>
            )}
        </div>
    );
}
