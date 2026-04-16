import { useState, useRef } from "react";
import { ArrowDownTrayIcon, ArrowPathIcon, EnvelopeIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import Modal from "./Modal";
import UserDataExportService from "../../api/services/UserDataExportService";

interface ExportDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmail: string;
}

export default function ExportDataModal({
    isOpen,
    onClose,
    userEmail
}: ExportDataModalProps) {
    const [confirmEmail, setConfirmEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleExport = async () => {
        if (!confirmEmail) {
            setError("Veuillez saisir votre adresse email");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const token = localStorage.getItem('firebaseIdToken');
            const email = localStorage.getItem('email');

            if (!token || !email) {
                throw new Error('Non authentifie');
            }

            const response = await UserDataExportService.requestDataExport(email, token, confirmEmail);

            if (response.success) {
                setSuccess(response.message);
                setConfirmEmail("");
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
        setConfirmEmail("");
        setError(null);
        setSuccess(null);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Exporter mes données"
            size="md"
        >
            <div className="space-y-6">
                {/* Info */}
                <div className="bg-cout-yellow/10 border border-cout-yellow/30 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <InformationCircleIcon className="w-6 h-6 text-cout-yellow flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-text-primary font-semibold">
                                Export de vos données personnelles
                            </p>
                            <p className="text-text-secondary text-sm mt-1">
                                Conformément au RGPD (Article 20), vous pouvez exporter toutes vos données personnelles stockées sur Plan Appétit.
                            </p>
                        </div>
                    </div>
                </div>

                {/* What will be exported */}
                <div className="bg-secondary rounded-xl p-4">
                    <p className="text-text-primary font-semibold mb-3">
                        Ce qui sera exporté :
                    </p>
                    <ul className="space-y-2 text-text-secondary text-sm">
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-cout-base rounded-full"></span>
                            Vos informations de profil
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-cout-base rounded-full"></span>
                            Toutes vos recettes (ingrédients et étapes)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-cout-base rounded-full"></span>
                            Vos collections
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-cout-base rounded-full"></span>
                            Vos statistiques d'utilisation
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-cout-base rounded-full"></span>
                            Vos informations d'abonnement
                        </li>
                    </ul>
                </div>

                {/* Email info */}
                <div className="bg-secondary rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <EnvelopeIcon className="w-5 h-5 text-cout-base flex-shrink-0 mt-0.5" />
                        <p className="text-text-secondary text-sm">
                            Vos données seront envoyées à <span className="font-semibold text-text-primary">{userEmail}</span> sous forme de fichier JSON.
                        </p>
                    </div>
                </div>

                {/* Email confirmation input */}
                {!success && (
                    <div>
                        <label className="block text-text-primary font-semibold mb-2">
                            Confirmez votre email
                        </label>
                        <input
                            ref={inputRef}
                            type="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value.toLowerCase())}
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
                            placeholder={userEmail}
                            className="w-full px-4 py-3 bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-cout-base"
                            autoComplete="email"
                        />
                        <p className="text-text-secondary text-xs mt-2">
                            Pour des raisons de sécurité, vous devez saisir votre adresse email pour confirmer l'export.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-green-600 text-sm">{success}</p>
                    </div>
                )}

                {/* Rate limit info */}
                <p className="text-text-secondary text-xs text-center">
                    Limite : 1 export par jour
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    {!success ? (
                        <button
                            onClick={handleExport}
                            disabled={isLoading || !confirmEmail}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cout-base text-white font-semibold rounded-xl hover:bg-cout-purple transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <ArrowDownTrayIcon className="w-5 h-5" />
                                    Recevoir mes données par email
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleClose}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-cout-yellow text-cout-purple font-semibold rounded-xl hover:bg-yellow-400 transition-all duration-200"
                        >
                            Fermer
                        </button>
                    )}

                    {!success && (
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="w-full px-6 py-3 bg-secondary border border-border-color text-text-primary font-semibold rounded-xl hover:bg-cout-yellow hover:text-cout-purple hover:border-cout-yellow transition-all duration-200 disabled:opacity-50"
                        >
                            Annuler
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
