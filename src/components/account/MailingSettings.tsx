import { useState, useEffect } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/solid";
import BackendService from "../../api/services/BackendService";

interface MailingSettingsProps {
    initialUnsubscribed: boolean;
    onStatusChanged: (unsubscribed: boolean) => void;
}

export default function MailingSettings({ initialUnsubscribed, onStatusChanged }: MailingSettingsProps) {
    const [unsubscribed, setUnsubscribed] = useState(initialUnsubscribed);
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        setUnsubscribed(initialUnsubscribed);
    }, [initialUnsubscribed]);

    const handleToggle = async () => {
        const token = localStorage.getItem('firebaseIdToken');
        const email = localStorage.getItem('email');
        if (!token || !email) return;

        setLoading(true);
        try {
            const result = await BackendService.toggleMailingSubscription(email, token);
            setUnsubscribed(result.unsubscribedFromMailing);
            onStatusChanged(result.unsubscribedFromMailing);
            setShowConfirm(false);
        } catch (err) {
            console.error('Erreur toggle mailing:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-primary rounded-xl p-6 shadow-lg border border-border-color">
            <div className="flex items-center gap-3 mb-3">
                <EnvelopeIcon className="w-5 h-5 text-cout-base" />
                <h3 className="text-lg font-bold text-text-primary">Emails & newsletters</h3>
            </div>

            <div className="flex items-center justify-between">
                <p className="text-text-secondary text-sm pr-4">
                    {unsubscribed
                        ? "Vous ne recevez plus nos emails. Réactivez pour être informé(e) des nouveautés."
                        : "Vous recevez nos emails concernant les nouveautés de Plan'Appétit."
                    }
                </p>

                <button
                    onClick={() => {
                        if (unsubscribed) {
                            handleToggle();
                        } else {
                            setShowConfirm(true);
                        }
                    }}
                    disabled={loading}
                    className={`flex-shrink-0 relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                        unsubscribed ? 'bg-border-color' : 'bg-cout-base'
                    }`}
                >
                    <span
                        className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                            unsubscribed ? 'translate-x-1' : 'translate-x-6'
                        }`}
                    />
                </button>
            </div>

            {showConfirm && (
                <div className="mt-4 p-3 bg-cout-yellow/10 border border-cout-yellow/30 rounded-lg">
                    <p className="text-text-primary text-sm mb-3">
                        Voulez-vous vraiment vous désabonner de nos emails ?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 px-3 py-2 bg-secondary border border-border-color text-text-primary text-sm font-medium rounded-lg"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleToggle}
                            disabled={loading}
                            className="flex-1 px-3 py-2 bg-cout-base text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                        >
                            {loading ? "..." : "Confirmer"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
