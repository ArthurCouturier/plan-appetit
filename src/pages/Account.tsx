import React, { useEffect, useState } from 'react';
import { updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth } from '../api/authentication/firebase';
import useAuth from '../api/hooks/useAuth';
import Header from '../components/global/Header';
import Footer from '../components/global/Footer';
import BackendService from '../api/services/BackendService';
import SubscriptionService from '../api/services/SubscriptionService';
import CreditPaywallModal from '../components/popups/CreditPaywallModal';
import CancelSubscriptionModal from '../components/popups/CancelSubscriptionModal';
import DeleteAccountModal from '../components/popups/DeleteAccountModal';
import PremiumStatusCard from '../components/account/PremiumStatusCard';
import NotificationSettings from '../components/account/NotificationSettings';
import AccountDeletionService from '../api/services/AccountDeletionService';
import { SunIcon, MoonIcon, KeyIcon, ArrowRightOnRectangleIcon, SparklesIcon, PlusIcon, TrashIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { isPremiumUser } from '../api/interfaces/users/UserInterface';
import { SubscriptionStatusInterface } from '../api/interfaces/subscription/SubscriptionStatusInterface';
import CreditIcon from '../components/icons/CreditIcon';
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist';
import UserAvatar from '../components/global/UserAvatar';

export default function Account() {
    const { user, logout, login } = useAuth();
    const navigate = useNavigate();

    // Vérifier si l'utilisateur est premium
    const isUserPremium = user && user.role ? isPremiumUser(user.role) : false;

    // All hooks must be at the top, before any conditional returns
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [enabled, setEnabled] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'theme1');
    const [credits, setCredits] = useState<number | null>(null);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatusInterface | null>(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(false);
    const [deletionScheduled, setDeletionScheduled] = useState<string | null>(null);
    const [cancellingDeletion, setCancellingDeletion] = useState(false);

    const fetchAccountInfo = async () => {
        const token = localStorage.getItem('firebaseIdToken');
        const email = localStorage.getItem('email') as string;
        if (token && email) {
            try {
                const accountInfo = await BackendService.getAccountInfo(email, token);
                setCredits(accountInfo.credits);

                // Mettre à jour le rôle dans le contexte Auth si différent
                if (user && user.role !== accountInfo.role) {
                    login({ ...user, role: accountInfo.role });
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des informations du compte:', error);
            }
        }
    };

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
            fetchAccountInfo();
            fetchSubscriptionStatus();
            fetchDeletionStatus();
        }
    }, [user, navigate, isUserPremium]);

    useEffect(() => {
        document.documentElement.classList.remove('theme1', 'theme2');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Now conditional return after all hooks
    if (user === undefined) {
        return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
    }

    const handleLogout = async () => {
        // Marquer que l'utilisateur s'est déconnecté volontairement AVANT tout
        localStorage.setItem('userLoggedOut', 'true');

        // Nettoyer le localStorage
        localStorage.removeItem('firebaseIdToken');
        localStorage.removeItem('profilePhoto');
        localStorage.removeItem('email');
        localStorage.removeItem('recipeGenerationDraft');
        localStorage.removeItem('anonymousRecipeUuid');
        localStorage.setItem('recipes', JSON.stringify([]));

        // D'abord mettre à jour le state pour éviter les requêtes pendant la déconnexion
        logout();

        // Déconnecter Firebase
        if (Capacitor.isNativePlatform()) {
            // Sur natif, utiliser uniquement le plugin Capacitor
            try {
                await FirebaseAuthentication.signOut();
                console.log('Déconnexion Firebase native réussie');
            } catch (error) {
                console.error('Erreur lors de la déconnexion Firebase native:', error);
            }
        } else {
            // Sur web, utiliser le SDK Firebase web
            try {
                await auth.signOut();
            } catch (error) {
                console.error('Erreur lors de la déconnexion Firebase web:', error);
            }
        }

        // Naviguer vers login
        navigate('/login', { replace: true });
    };

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
            setError(err instanceof Error ? err.message : 'An error happened');
        }
        setLoading(false);
    };

    const changeTheme = () => {
        setEnabled(!enabled);
        setTheme(prev => (prev === 'theme1' ? 'theme2' : 'theme1'));
    };

    return (
        <div className='min-h-screen bg-bg-color flex flex-col'>
            <div className={`flex-grow ${isMobile ? 'px-4 pb-24 mobile-content-with-header' : 'p-6'}`}>
                {isMobile ? null : <AccountHeader />}

                <div className="max-w-2xl mx-auto mt-4 space-y-4">
                    {/* User Info Card */}
                    <div className="bg-primary rounded-xl p-6 shadow-lg border border-border-color">
                        <div className="flex flex-col items-center text-center mb-2">
                            <UserAvatar size="xl" className="mb-4" />
                            <h2 className="text-2xl font-bold text-text-primary">
                                {user && user.displayName}
                            </h2>
                            <p className="text-text-secondary text-sm mt-1">
                                {user && user.email}
                            </p>
                            {isUserPremium && (
                                <p className="text-cout-yellow font-bold text-sm mt-2">
                                    Plan Appétit Premium
                                </p>
                            )}

                            {/* Affichage des crédits */}
                            <div className="mt-4 flex items-center justify-center gap-2 bg-secondary border border-border-color rounded-lg px-4 py-2">
                                <CreditIcon className="w-5 h-5 text-cout-yellow" />
                                <span className="text-text-primary font-bold">
                                    {isUserPremium ? '∞' : (credits !== null ? credits : '...')}
                                </span>
                                <span className="text-text-secondary text-sm">
                                    crédit{isUserPremium || credits !== 1 ? 's' : ''}
                                </span>
                                {!isUserPremium && (
                                    <button
                                        onClick={() => setShowCreditModal(true)}
                                        className="ml-2 p-1 bg-cout-yellow text-cout-purple rounded-full hover:bg-yellow-400 transition-colors"
                                        title="Recharger des crédits"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Modal de rechargement des crédits */}
                    <CreditPaywallModal
                        isOpen={showCreditModal}
                        onClose={() => setShowCreditModal(false)}
                    />

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

                    {/* Carte de statut Premium pour les utilisateurs premium */}
                    {isUserPremium && (
                        <PremiumStatusCard
                            subscriptionStatus={subscriptionStatus}
                            onCancelClick={() => setShowCancelModal(true)}
                            onStatusUpdated={setSubscriptionStatus}
                            isLoading={subscriptionLoading}
                        />
                    )}

                    <OnboardingChecklist onCreditsUpdated={fetchAccountInfo} />

                    {/* Change Password Card */}
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

                    {/* Theme Switcher (Mobile only) */}
                    {isMobile && (
                        <div className="bg-primary rounded-xl p-6 shadow-lg border border-border-color">
                            <div className="flex items-center justify-between">
                                <span className="text-base font-bold text-text-primary">Apparence</span>
                                <div className="flex items-center gap-3">
                                    <MoonIcon className="w-5 h-5 text-cout-purple" />
                                    <button
                                        onClick={changeTheme}
                                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${theme === "theme1" ? "bg-cout-yellow" : "bg-cout-purple"
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 ${theme === "theme1" ? "translate-x-6" : "translate-x-1"
                                                }`}
                                        />
                                    </button>
                                    <SunIcon className="w-5 h-5 text-cout-yellow" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Paramètres de notifications pour les utilisateurs premium */}
                    <NotificationSettings isPremium={isUserPremium} />

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
                        {/* Afficher le bouton "Devenir Premium" seulement si l'utilisateur n'est pas premium */}
                        {!isUserPremium && (
                            <button
                                onClick={() => navigate("/premium")}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-cout-yellow text-cout-purple font-bold rounded-xl shadow-lg hover:bg-yellow-400 transition-all duration-200"
                            >
                                <SparklesIcon className="w-5 h-5" />
                                Devenir Premium
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary border-2 border-red-500/50 text-red-600 font-semibold rounded-xl hover:bg-red-500/10 transition-all duration-200"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            Se déconnecter
                        </button>

                        {/* Bouton de suppression de compte */}
                        {!deletionScheduled && (
                            <button
                                onClick={() => setShowDeleteAccountModal(true)}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary border border-border-color text-text-secondary font-semibold rounded-xl hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-600 transition-all duration-200"
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
};

function AccountHeader() {
    return (
        <Header
            back={true}
            home={true}
            title={true}
            profile={false}
            pageName={"Mon compte"}
        />
    )
}
