import { useState } from "react";
import { SparklesIcon, ArrowPathIcon, XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { SubscriptionStatusInterface } from "../../api/interfaces/subscription/SubscriptionStatusInterface";
import SubscriptionService from "../../api/services/SubscriptionService";

interface PremiumStatusCardProps {
    subscriptionStatus: SubscriptionStatusInterface | null;
    onCancelClick: () => void;
    onStatusUpdated: (status: SubscriptionStatusInterface) => void;
    isLoading: boolean;
}

export default function PremiumStatusCard({
    subscriptionStatus,
    onCancelClick,
    onStatusUpdated,
    isLoading
}: PremiumStatusCardProps) {
    const [reactivating, setReactivating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="bg-primary rounded-xl p-6 shadow-lg border border-border-color">
                <div className="animate-pulse">
                    <div className="h-6 bg-secondary rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-secondary rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-secondary rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (!subscriptionStatus || !subscriptionStatus.isActive) {
        return null;
    }

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return "Date non disponible";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleReactivate = async () => {
        setReactivating(true);
        setError(null);

        try {
            const token = localStorage.getItem('firebaseIdToken');
            const email = localStorage.getItem('email');

            if (!token || !email) {
                throw new Error('Non authentifié');
            }

            const updatedStatus = await SubscriptionService.reactivateSubscription(email, token);
            onStatusUpdated(updatedStatus);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setReactivating(false);
        }
    };

    const isCancelled = subscriptionStatus.cancelAtPeriodEnd;

    return (
        <div className={`bg-primary rounded-xl p-6 shadow-lg border-2 ${isCancelled ? 'border-orange-400' : 'border-cout-yellow'}`}>
            <div className="flex items-center gap-3 mb-4">
                <SparklesIcon className={`w-6 h-6 ${isCancelled ? 'text-orange-400' : 'text-cout-yellow'}`} />
                <h3 className="text-lg font-bold text-text-primary">Mon abonnement Premium</h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Statut</span>
                    <div className="flex items-center gap-2">
                        {isCancelled ? (
                            <>
                                <XCircleIcon className="w-5 h-5 text-orange-400" />
                                <span className="text-orange-400 font-semibold">Annulation programmée</span>
                            </>
                        ) : (
                            <>
                                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                                <span className="text-green-500 font-semibold">Actif</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-text-secondary">
                        {isCancelled ? "Fin de l'accès Premium" : "Prochain renouvellement"}
                    </span>
                    <span className="text-text-primary font-semibold">
                        {formatDate(subscriptionStatus.currentPeriodEnd)}
                    </span>
                </div>
            </div>

            {isCancelled ? (
                <div className="space-y-3">
                    <p className="text-sm text-text-secondary text-center">
                        Vous conservez l'accès Premium jusqu'au {formatDate(subscriptionStatus.currentPeriodEnd)}.
                        <br />
                        Vous pouvez réactiver votre abonnement à tout moment.
                    </p>
                    <button
                        onClick={handleReactivate}
                        disabled={reactivating}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cout-yellow text-cout-purple font-bold rounded-xl hover:bg-yellow-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {reactivating ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                Réactivation...
                            </>
                        ) : (
                            <>
                                <ArrowPathIcon className="w-5 h-5" />
                                Réactiver mon abonnement
                            </>
                        )}
                    </button>
                </div>
            ) : (
                <button
                    onClick={onCancelClick}
                    className="w-full px-6 py-3 bg-secondary border border-border-color text-text-secondary font-semibold rounded-xl hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600 transition-all duration-200"
                >
                    Annuler mon abonnement
                </button>
            )}
        </div>
    );
}
