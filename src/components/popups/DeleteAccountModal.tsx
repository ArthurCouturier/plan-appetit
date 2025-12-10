import { useState, useRef } from "react";
import { ExclamationTriangleIcon, ArrowPathIcon, TrashIcon } from "@heroicons/react/24/solid";
import Modal from "./Modal";
import AccountDeletionService from "../../api/services/AccountDeletionService";

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeleted: (scheduledDate: string) => void;
    hasActiveSubscription: boolean;
    subscriptionSource?: 'stripe' | 'apple' | 'unknown';
}

export default function DeleteAccountModal({
    isOpen,
    onClose,
    onDeleted,
    hasActiveSubscription,
    subscriptionSource
}: DeleteAccountModalProps) {
    const [confirmText, setConfirmText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const CONFIRM_TEXT = "SUPPRIMER";

    const handleConfirmDelete = async () => {
        if (confirmText !== CONFIRM_TEXT) {
            setError(`Veuillez taper "${CONFIRM_TEXT}" pour confirmer`);
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

            const response = await AccountDeletionService.requestAccountDeletion(email, token);

            if (response.success) {
                onDeleted(response.scheduledDeletionDate || '');
                onClose();
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setConfirmText("");
        setError(null);
        onClose();
    };

    const formatDate = (daysFromNow: number): string => {
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Supprimer mon compte"
            size="md"
        >
            <div className="space-y-6">
                {/* Danger warning */}
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-text-primary font-semibold">
                                Attention : cette action est irréversible
                            </p>
                            <p className="text-text-secondary text-sm mt-1">
                                Toutes vos données seront définitivement supprimées dans 14 jours.
                            </p>
                        </div>
                    </div>
                </div>

                {/* What will be deleted */}
                <div className="bg-secondary rounded-xl p-4">
                    <p className="text-text-primary font-semibold mb-3">
                        Ce qui sera supprimé :
                    </p>
                    <ul className="space-y-2 text-text-secondary text-sm">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            Toutes vos recettes créées et importées
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            Vos collections et favoris
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            Vos crédits de génération restants
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                            Votre historique et statistiques
                        </li>
                    </ul>
                </div>

                {/* Subscription warning */}
                {hasActiveSubscription && (
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-text-primary font-semibold">
                                    Vous avez un abonnement actif
                                </p>
                                <p className="text-text-secondary text-sm mt-1">
                                    {subscriptionSource === 'apple'
                                        ? "Pensez à annuler votre abonnement dans les paramètres de l'App Store pour éviter les futurs prélèvements."
                                        : "Votre abonnement sera automatiquement annulé lors de la suppression du compte."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Grace period info */}
                <div className="bg-cout-yellow/10 border border-cout-yellow/30 rounded-xl p-4">
                    <p className="text-text-primary text-sm">
                        <span className="font-semibold">Période de grâce de 14 jours :</span>{" "}
                        Vous pouvez annuler cette demande jusqu'au{" "}
                        <span className="font-semibold">{formatDate(14)}</span>.
                        Après cette date, votre compte et toutes vos données seront définitivement supprimés.
                    </p>
                </div>

                {/* Confirmation input */}
                <div>
                    <label className="block text-text-primary font-semibold mb-2">
                        Pour confirmer, tapez "{CONFIRM_TEXT}"
                    </label>
                    <input
                        ref={inputRef}
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                        onFocus={() => {
                            setTimeout(() => {
                                const modalContainer = inputRef.current?.closest('.overflow-y-auto');
                                if (modalContainer && inputRef.current) {
                                    const inputRect = inputRef.current.getBoundingClientRect();
                                    const containerRect = modalContainer.getBoundingClientRect();
                                    const scrollOffset = inputRect.top - containerRect.top - (containerRect.height / 3);
                                    modalContainer.scrollBy({ top: scrollOffset, behavior: 'smooth' });
                                }
                            }, 300);
                        }}
                        placeholder={CONFIRM_TEXT}
                        className="w-full px-4 py-3 bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-red-500"
                        autoComplete="off"
                    />
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleConfirmDelete}
                        disabled={isLoading || confirmText !== CONFIRM_TEXT}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                Suppression en cours...
                            </>
                        ) : (
                            <>
                                <TrashIcon className="w-5 h-5" />
                                Supprimer mon compte
                            </>
                        )}
                    </button>

                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="w-full px-6 py-3 bg-secondary border border-border-color text-text-primary font-semibold rounded-xl hover:bg-cout-yellow hover:text-cout-purple hover:border-cout-yellow transition-all duration-200 disabled:opacity-50"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </Modal>
    );
}
