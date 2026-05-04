import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth } from '../api/authentication/firebase';
import useAuth from '../api/hooks/useAuth';
import Footer from '../components/global/Footer';
import BackendService from '../api/services/BackendService';
import CreditPaywallModal from '../components/modals/CreditPaywallModal';
import { SunIcon, MoonIcon, ArrowRightOnRectangleIcon, SparklesIcon, PlusIcon, WrenchScrewdriverIcon, PencilSquareIcon } from "@heroicons/react/24/solid";
import { isPremiumUser, hasRoleLevel, UserRole } from '../api/interfaces/users/UserInterface';
import CreditIcon from '../components/icons/CreditIcon';
import UserAvatar from '../components/global/UserAvatar';
import useIsMobile from '../hooks/useIsMobile';
import { dispatchFeedbackEvent } from '../components/feedbacks/feedbackEvents';
import useFeedback from '../api/hooks/useFeedback';
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import ReferralSection from '../components/referral/ReferralSection';
import EditProfileModal from '../components/profile/EditProfileModal';

export default function Account() {
    const { user, logout, login } = useAuth();
    const navigate = useNavigate();

    const isUserPremium = user && user.role ? isPremiumUser(user.role) : false;

    const isMobile = useIsMobile();
    const { requestFeedback } = useFeedback();
    const [enabled, setEnabled] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'theme1');
    const [credits, setCredits] = useState<number | null>(null);
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);

    const fetchAccountInfo = async () => {
        const token = localStorage.getItem('firebaseIdToken');
        const email = localStorage.getItem('email') as string;
        if (token && email) {
            try {
                const accountInfo = await BackendService.getAccountInfo(email, token);
                setCredits(accountInfo.credits);

                if (user && user.role !== accountInfo.role) {
                    login({ ...user, role: accountInfo.role });
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des informations du compte:', error);
            }
        }
    };

    useEffect(() => {
        if (user === null) {
            navigate('/login');
        } else if (user) {
            fetchAccountInfo();
        }
    }, [user, navigate]);

    useEffect(() => {
        if (credits !== null && credits <= 1 && !isUserPremium) {
            dispatchFeedbackEvent("credit_depleted");
        }
    }, [credits, isUserPremium]);

    useEffect(() => {
        document.documentElement.classList.remove('theme1', 'theme2');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);


    if (user === undefined) {
        return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
    }

    const handleLogout = async () => {
        localStorage.setItem('userLoggedOut', 'true');

        localStorage.removeItem('firebaseIdToken');
        localStorage.removeItem('profilePhoto');
        localStorage.removeItem('email');
        localStorage.removeItem('recipeGenerationDraft');
        localStorage.removeItem('anonymousRecipeUuid');
        localStorage.removeItem('defaultCollectionUuid');
        localStorage.setItem('recipes', JSON.stringify([]));
        Object.keys(localStorage).filter(k => k.startsWith('collection_cache_')).forEach(k => localStorage.removeItem(k));

        logout();

        if (Capacitor.isNativePlatform()) {
            try {
                await FirebaseAuthentication.signOut();
                console.log('Déconnexion Firebase native réussie');
            } catch (error) {
                console.error('Erreur lors de la déconnexion Firebase native:', error);
            }
        } else {
            try {
                await auth.signOut();
            } catch (error) {
                console.error('Erreur lors de la déconnexion Firebase web:', error);
            }
        }

        navigate('/login', { replace: true });
    };

    const changeTheme = () => {
        setEnabled(!enabled);
        setTheme(prev => (prev === 'theme1' ? 'theme2' : 'theme1'));
    };

    return (
        <div className='min-h-screen bg-bg-color flex flex-col'>
            <div className={`flex-grow ${isMobile ? 'px-4 pb-24 mobile-content-with-header' : 'p-6'}`}>
                <div className="max-w-2xl mx-auto mt-4 space-y-4">
                    {/* User Info Card */}
                    <div className="relative bg-primary rounded-xl p-6 shadow-lg border border-border-color">
                        <button
                            onClick={() => setShowEditProfileModal(true)}
                            aria-label="Modifier mon profil"
                            className="absolute top-3 right-3 p-2 rounded-full text-text-secondary hover:text-cout-purple hover:bg-secondary transition-colors"
                        >
                            <PencilSquareIcon className="w-5 h-5" />
                        </button>
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
                    {showCreditModal && (
                        <CreditPaywallModal onClose={() => setShowCreditModal(false)} />
                    )}

                    {/* Modal d'édition de profil */}
                    {showEditProfileModal && user && (
                        <EditProfileModal
                            onClose={() => setShowEditProfileModal(false)}
                            onSaved={(profile) => {
                                if (profile.profilePhoto) {
                                    localStorage.setItem("profilePhoto", profile.profilePhoto);
                                } else {
                                    localStorage.setItem("profilePhoto", "/no-pp.jpg");
                                }
                                login({
                                    ...user,
                                    displayName: profile.displayName,
                                    profilePhoto: profile.profilePhoto ?? "/no-pp.jpg",
                                });
                            }}
                        />
                    )}

                    {/* Code ami */}
                    <ReferralSection />

                    {/* Theme Switcher */}
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

                    {/* Feedback utilisateur */}
                    <div className="mt-2">
                        <button
                            onClick={() => requestFeedback("user-feedback-v1")}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border-color text-text-primary bg-primary hover:bg-secondary transition-colors text-sm font-medium"
                        >
                            <ChatBubbleLeftRightIcon className="w-5 h-5 text-text-secondary" />
                            Une idée ? Un problème ?
                        </button>
                    </div>

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

                        {user && hasRoleLevel(user.role, UserRole.ADMIN) && (
                            <button
                                onClick={() => navigate("/admin")}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary border-2 border-cout-purple/50 text-cout-purple font-semibold rounded-xl hover:bg-cout-purple/10 transition-all duration-200"
                            >
                                <WrenchScrewdriverIcon className="w-5 h-5" />
                                Administration
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary border-2 border-red-500/50 text-red-600 font-semibold rounded-xl hover:bg-red-500/10 transition-all duration-200"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            Se déconnecter
                        </button>

                        {/* Lien vers les paramètres du compte */}
                        <button
                            onClick={() => navigate("/profile/settings")}
                            className="w-full text-center text-blue-500 underline text-sm"
                        >
                            Gérer mon compte et mes données
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}

