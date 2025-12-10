import React, { useEffect, useState } from 'react';
import { updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../api/authentication/firebase';
import useAuth from '../api/hooks/useAuth';
import Header from '../components/global/Header';
import Footer from '../components/global/Footer';
import SubscriptionService from '../api/services/SubscriptionService';
import CancelSubscriptionModal from '../components/popups/CancelSubscriptionModal';
import DeleteAccountModal from '../components/popups/DeleteAccountModal';
import ExportDataModal from '../components/popups/ExportDataModal';
import PremiumStatusCard from '../components/account/PremiumStatusCard';
import NotificationSettings from '../components/account/NotificationSettings';
import AccountDeletionService from '../api/services/AccountDeletionService';
import { KeyIcon, TrashIcon, XCircleIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import { isPremiumUser } from '../api/interfaces/users/UserInterface';
import { SubscriptionStatusInterface } from '../api/interfaces/subscription/SubscriptionStatusInterface';

export default function AccountSettings() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const isUserPremium = user && user.role ? isPremiumUser(user.role) : false;

    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusInterface | null>(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);
    const [deletionScheduled, setDeletionScheduled] = useState<string | null>(null);
    const [cancellingDeletion, setCancellingDeletion] = useState(false);

    const fetchSubscriptionStatus = async () => {
        const token = localStorage.getItem('firebaseIdToken');
        const email = localStorage.getItem('email');
        if (token && email && isUserPremium) {
            setSubscriptionLoading(true);
            try {
                const status = await SubscriptionService.getSubscriptionStatus(email, token);
                setSubscriptionStatus(status);
            } catch (error) {
                console.error('Erreur lors de la récupération du statut de l\'abonnement:', error);
            } finally {
                setSubscriptionLoading(false);
            }
        }
    };

    const fetchDeletionStatus = async () => {
        const token = localStorage.getItem('firebaseIdToken');
        const email = localStorage.getItem('email');
        if (token && email) {
            try {
                const status = await AccountDeletionService.getAccountDeletionStatus(email, token);
                if (status.isDeletionScheduled && status.scheduledDeletionDate) {
                    setDeletionScheduled(status.scheduledDeletionDate);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération du statut de suppression:', error);
            }
        }
    };

    const handleCancelDeletion = async () => {
        const token = localStorage.getItem('firebaseIdToken');
        const email = localStorage.getItem('email');
        if (!token || !email) return;

        setCancellingDeletion(true);
        try {
            const response = await AccountDeletionService.cancelAccountDeletion(email, token);
            if (response.success) {
                setDeletionScheduled(null);
            }
        } catch (error) {
            console.error('Erreur lors de l\'annulation de la suppression:', error);
        } finally {
            setCancellingDeletion(false);
        }
    };

    useEffect(() => {
        if (user === null) {
            navigate('/login');
        } else if (user) {
            fetchSubscriptionStatus();
            fetchDeletionStatus();
        }
    }, [user, navigate, isUserPremium]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (user === undefined) {
        return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        setLoading(true);
        try {
            await updatePassword(auth.currentUser!, newPassword);
            setMessage('Mot de passe mis à jour');
            setNewPassword('');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
        setLoading(false);
    };

    return (
        <div className='min-h-screen bg-bg-color flex flex-col'>
            <div className={`flex-grow ${isMobile ? 'px-4 pb-24 mobile-content-with-header' : 'p-6'}`}>
                {isMobile ? null : <SettingsHeader />}

                <div className="max-w-2xl mx-auto mt-4 space-y-4">
                    {/* Modal d'annulation d'abonnement */}
                    <CancelSubscriptionModal
                        isOpen={showCancelModal}
                        onClose={() => setShowCancelModal(false)}
                        currentPeriodEnd={subscriptionStatus?.currentPeriodEnd ?? null}
                        onCancelled={(status) => setSubscriptionStatus(status)}
                    />

                    {/* Modal de suppression de compte */}
                    <DeleteAccountModal
                        isOpen={showDeleteAccountModal}
                        onClose={() => setShowDeleteAccountModal(false)}
                        onDeleted={(scheduledDate) => setDeletionScheduled(scheduledDate)}
                        hasActiveSubscription={subscriptionStatus?.isActive ?? false}
                        subscriptionSource={subscriptionStatus?.subscriptionSource}
                    />

                    {/* Modal d'export des données */}
                    <ExportDataModal
                        isOpen={showExportModal}
                        onClose={() => setShowExportModal(false)}
                        userEmail={user?.email || ''}
                    />

                    {/* Paramètres de notifications */}
                    <NotificationSettings isPremium={isUserPremium} />

                    {/* Changement de mot de passe */}
                    <div className="bg-primary rounded-xl p-6 shadow-lg border border-border-color">
                        <div className="flex items-center gap-3 mb-4">
                            <KeyIcon className="w-5 h-5 text-cout-base" />
                            <h3 className="text-lg font-bold text-text-primary">Changer le mot de passe</h3>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}
                        {message && (
                            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <p className="text-green-600 text-sm">{message}</p>
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    placeholder="Nouveau mot de passe"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-secondary border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-cout-base"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 bg-cout-base text-white font-semibold rounded-lg hover:bg-cout-purple transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
                            </button>
                        </form>
                    </div>

                    {/* Carte de statut Premium pour les utilisateurs premium */}
                    {isUserPremium && (
                        <PremiumStatusCard
                            subscriptionStatus={subscriptionStatus}
                            onCancelClick={() => setShowCancelModal(true)}
                            onStatusUpdated={setSubscriptionStatus}
                            isLoading={subscriptionLoading}
                        />
                    )}

                    {/* Bannière de suppression programmée */}
                    {deletionScheduled && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-text-primary font-semibold">
                                        Suppression programmée
                                    </p>
                                    <p className="text-text-secondary text-sm mt-1">
                                        Votre compte sera supprimé le{" "}
                                        {new Date(deletionScheduled).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}.
                                    </p>
                                    <button
                                        onClick={handleCancelDeletion}
                                        disabled={cancellingDeletion}
                                        className="mt-3 px-4 py-2 bg-cout-yellow text-cout-purple font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                    >
                                        {cancellingDeletion ? 'Annulation...' : 'Annuler la suppression'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        {/* Bouton d'export des données */}
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary border-2 border-blue-500/50 text-blue-600 font-semibold rounded-xl hover:bg-blue-500/10 transition-all duration-200"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            Exporter mes données
                        </button>

                        {/* Bouton de suppression de compte */}
                        {!deletionScheduled && (
                            <button
                                onClick={() => setShowDeleteAccountModal(true)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary border-2 border-red-500/50 text-red-600 font-semibold rounded-xl hover:bg-red-500/10 transition-all duration-200"
                            >
                                <TrashIcon className="w-5 h-5" />
                                Supprimer mon compte
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

function SettingsHeader() {
    return (
        <Header
            back={true}
            home={true}
            title={true}
            profile={false}
            pageName={"Gérer mon compte"}
        />
    )
}
