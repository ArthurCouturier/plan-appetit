import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { ShieldCheckIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import ConsentService from '../../api/services/ConsentService';

export default function CookieConsentBanner() {
    const [visible, setVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [marketing, setMarketing] = useState(false);

    useEffect(() => {
        // Sur native, pas de bandeau — le consentement est géré par ATT (iOS)
        if (Capacitor.isNativePlatform()) return;

        ConsentService.hasConsented().then(consented => {
            if (!consented) setVisible(true);
        });
    }, []);

    if (!visible) return null;

    const handleAcceptAll = async () => {
        await ConsentService.acceptAll();
        setVisible(false);
    };

    const handleRejectNonEssential = async () => {
        await ConsentService.rejectNonEssential();
        setVisible(false);
    };

    const handleSaveCustom = async () => {
        await ConsentService.setConsent({ analytics, marketing });
        setVisible(false);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
            <div className="max-w-lg mx-auto bg-primary rounded-2xl shadow-2xl border border-border-color p-5">
                <div className="flex items-start gap-3 mb-3">
                    <ShieldCheckIcon className="w-6 h-6 text-cout-base flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-text-primary font-bold text-base">
                            Respect de votre vie privée
                        </h3>
                        <p className="text-text-secondary text-sm mt-1">
                            Nous utilisons des cookies pour améliorer votre expérience et analyser l'utilisation de l'application.{' '}
                            <a href="/legal/politique-de-confidentialite" className="text-cout-base underline">
                                En savoir plus
                            </a>
                        </p>
                    </div>
                </div>

                {showDetails && (
                    <div className="space-y-3 mb-4 pt-3 border-t border-border-color">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-primary text-sm font-semibold">Essentiels</p>
                                <p className="text-text-secondary text-xs">Fonctionnement de l'application</p>
                            </div>
                            <div className="bg-cout-base/20 text-cout-base text-xs font-semibold px-2 py-1 rounded-full">
                                Toujours actif
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-primary text-sm font-semibold">Analytiques</p>
                                <p className="text-text-secondary text-xs">Statistiques d'utilisation anonymisées</p>
                            </div>
                            <button
                                onClick={() => setAnalytics(!analytics)}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                                    analytics ? 'bg-cout-base' : 'bg-thirdary'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                        analytics ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-text-primary text-sm font-semibold">Marketing</p>
                                <p className="text-text-secondary text-xs">Publicités personnalisées (Meta/Facebook)</p>
                            </div>
                            <button
                                onClick={() => setMarketing(!marketing)}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                                    marketing ? 'bg-cout-base' : 'bg-thirdary'
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                        marketing ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {showDetails ? (
                        <button
                            onClick={handleSaveCustom}
                            className="w-full px-4 py-2.5 bg-cout-base text-white font-semibold rounded-xl hover:bg-cout-purple transition-colors duration-200 text-sm"
                        >
                            Enregistrer mes choix
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleAcceptAll}
                                className="w-full px-4 py-2.5 bg-cout-base text-white font-semibold rounded-xl hover:bg-cout-purple transition-colors duration-200 text-sm"
                            >
                                Tout accepter
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleRejectNonEssential}
                                    className="flex-1 px-4 py-2.5 bg-secondary text-text-primary font-semibold rounded-xl hover:bg-secondary/80 transition-colors duration-200 text-sm"
                                >
                                    Refuser
                                </button>
                                <button
                                    onClick={() => setShowDetails(true)}
                                    className="flex-1 px-4 py-2.5 bg-secondary text-text-primary font-semibold rounded-xl hover:bg-secondary/80 transition-colors duration-200 text-sm flex items-center justify-center gap-1"
                                >
                                    Personnaliser
                                    {showDetails
                                        ? <ChevronUpIcon className="w-4 h-4" />
                                        : <ChevronDownIcon className="w-4 h-4" />
                                    }
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

interface CookieConsentManagerProps {
    onClose: () => void;
}

export function CookieConsentManager({ onClose }: CookieConsentManagerProps) {
    const [analytics, setAnalytics] = useState(false);
    const [marketing, setMarketing] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        ConsentService.getConsent().then(consent => {
            if (consent) {
                setAnalytics(consent.analytics);
                setMarketing(consent.marketing);
            }
            setLoaded(true);
        });
    }, []);

    if (!loaded) return null;

    const handleSave = async () => {
        await ConsentService.setConsent({ analytics, marketing });
        onClose();
    };

    const handleRevokeAll = async () => {
        await ConsentService.rejectNonEssential();
        setAnalytics(false);
        setMarketing(false);
        onClose();
    };

    return (
        <div className="space-y-4">
            <p className="text-text-secondary text-sm">
                Gérez vos préférences de cookies. Les cookies essentiels sont toujours actifs.
            </p>

            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                        <p className="text-text-primary text-sm font-semibold">Essentiels</p>
                        <p className="text-text-secondary text-xs">Authentification, navigation</p>
                    </div>
                    <div className="bg-cout-base/20 text-cout-base text-xs font-semibold px-2 py-1 rounded-full">
                        Toujours actif
                    </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                        <p className="text-text-primary text-sm font-semibold">Analytiques</p>
                        <p className="text-text-secondary text-xs">Statistiques d'utilisation (PostHog)</p>
                    </div>
                    <button
                        onClick={() => setAnalytics(!analytics)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                            analytics ? 'bg-cout-base' : 'bg-thirdary'
                        }`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                analytics ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <div>
                        <p className="text-text-primary text-sm font-semibold">Marketing</p>
                        <p className="text-text-secondary text-xs">Publicités personnalisées (Meta)</p>
                    </div>
                    <button
                        onClick={() => setMarketing(!marketing)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                            marketing ? 'bg-cout-base' : 'bg-thirdary'
                        }`}
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                                marketing ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <button
                    onClick={handleRevokeAll}
                    className="flex-1 px-4 py-2.5 bg-secondary text-text-primary font-semibold rounded-lg hover:bg-secondary/80 transition-colors duration-200 text-sm"
                >
                    Tout refuser
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2.5 bg-cout-base text-white font-semibold rounded-lg hover:bg-cout-purple transition-colors duration-200 text-sm"
                >
                    Enregistrer
                </button>
            </div>
        </div>
    );
}
