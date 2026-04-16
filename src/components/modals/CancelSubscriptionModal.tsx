import { useState } from "react";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import Modal from "./Modal";
import {
    CancellationReasonCode,
    CancellationReasonLabels,
    CancelSubscriptionRequest,
    SubscriptionStatusInterface
} from "../../api/interfaces/subscription/SubscriptionStatusInterface";
import SubscriptionService from "../../api/services/SubscriptionService";

interface CancelSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPeriodEnd: string | null;
    onCancelled: (status: SubscriptionStatusInterface) => void;
}

export default function CancelSubscriptionModal({
    isOpen,
    onClose,
    currentPeriodEnd,
    onCancelled
}: CancelSubscriptionModalProps) {
    const [selectedReason, setSelectedReason] = useState<CancellationReasonCode | null>(null);
    const [otherReasonText, setOtherReasonText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return "Date non disponible";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleConfirmCancel = async () => {
        if (!selectedReason) {
            setError("Veuillez sélectionner une raison");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('firebaseIdToken');
            const email = localStorage.getItem('email');

            if (!token || !email) {
                throw new Error('Non authentifié');
            }

            const request: CancelSubscriptionRequest = {
                reasonCode: selectedReason,
                reasonText: selectedReason === CancellationReasonCode.OTHER ? otherReasonText : undefined
            };

            const updatedStatus = await SubscriptionService.cancelSubscription(email, token, request);
            onCancelled(updatedStatus);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedReason(null);
        setOtherReasonText("");
        setError(null);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Annuler mon abonnement"
            size="md"
        >
            <div className="space-y-6">
                {/* Warning message */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-text-primary font-semibold">
                                Vous conserverez l'accès Premium jusqu'au {formatDate(currentPeriodEnd)}
                            </p>
                            <p className="text-text-secondary text-sm mt-1">
                                Après cette date, vous perdrez l'accès aux fonctionnalités Premium et aux recettes illimitées.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reason selection */}
                <div>
                    <p className="text-text-primary font-semibold mb-3">
                        Pourquoi souhaitez-vous annuler ?
                    </p>
                    <p className="text-text-secondary text-sm mb-4">
                        Votre retour nous aide à améliorer Plan Appétit.
                    </p>

                    <div className="space-y-2">
                        {Object.entries(CancellationReasonLabels).map(([code, label]) => (
                            <label
                                key={code}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                    selectedReason === code
                                        ? 'border-cout-yellow bg-cout-yellow/10'
                                        : 'border-border-color hover:border-cout-base'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="cancellationReason"
                                    value={code}
                                    checked={selectedReason === code}
                                    onChange={() => setSelectedReason(code as CancellationReasonCode)}
                                    className="w-4 h-4 text-cout-yellow focus:ring-cout-yellow"
                                />
                                <span className="text-text-primary">{label}</span>
                            </label>
                        ))}
                    </div>

                    {/* Other reason text input */}
                    {selectedReason === CancellationReasonCode.OTHER && (
                        <div className="mt-4">
                            <textarea
                                value={otherReasonText}
                                onChange={(e) => setOtherReasonText(e.target.value)}
                                placeholder="Décrivez votre raison (optionnel)"
                                className="w-full px-4 py-3 bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-cout-base resize-none"
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleConfirmCancel}
                        disabled={isLoading || !selectedReason}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                Annulation en cours...
                            </>
                        ) : (
                            "Confirmer l'annulation"
                        )}
                    </button>

                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="w-full px-6 py-3 bg-secondary border border-border-color text-text-primary font-semibold rounded-xl hover:bg-cout-yellow hover:text-cout-purple hover:border-cout-yellow transition-all duration-200 disabled:opacity-50"
                    >
                        Garder mon abonnement
                    </button>
                </div>
            </div>
        </Modal>
    );
}
