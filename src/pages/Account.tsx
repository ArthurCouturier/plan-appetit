import React, { useEffect, useState } from 'react';
import { updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../api/authentication/firebase';
import useAuth from '../api/hooks/useAuth';
import Header from '../components/global/Header';
import Footer from '../components/global/Footer';
import BackendService from '../api/services/BackendService';
import CreditPaywallModal from '../components/popups/CreditPaywallModal';
import { SunIcon, MoonIcon, UserCircleIcon, KeyIcon, ArrowRightOnRectangleIcon, SparklesIcon, PlusIcon } from "@heroicons/react/24/solid";
import { isPremiumUser } from '../api/interfaces/users/UserInterface';
import CreditIcon from '../components/icons/CreditIcon';
import OnboardingChecklist from '../components/onboarding/OnboardingChecklist';

export default function Account() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Vérifier si l'utilisateur est premium
    const isUserPremium = user && user.role ? isPremiumUser(user.role) : false;
    const borderColor = isUserPremium ? "border-cout-yellow" : "border-cout-base";

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

    useEffect(() => {
        if (user === null) {
            navigate('/login');
        } else if (user) {
            const token = localStorage.getItem('firebaseIdToken');
            const email = localStorage.getItem('email') as string
            if (token && user.uid) {
                BackendService.getUserCredits(email, token)
                    .then(creditsCount => setCredits(creditsCount))
                    .catch(error => {
                        console.error('Erreur lors de la récupération des crédits:', error);
                    });
            }
        }
    }, [user, navigate]);

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
        localStorage.removeItem('firebaseIdToken');
        localStorage.removeItem('profilePhoto');
        localStorage.removeItem('email');
        localStorage.removeItem('recipeGenerationDraft');
        localStorage.setItem('recipes', JSON.stringify([]));
        await auth.signOut();
        logout();
        navigate('/login');
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
            <div className={`flex-grow ${isMobile ? 'px-4 pt-20 pb-24' : 'p-6'}`}>
                {isMobile ? null : <AccountHeader />}

                <div className="max-w-2xl mx-auto mt-4 space-y-4">
                    {/* User Info Card */}
                    <div className="bg-primary rounded-xl p-6 shadow-lg border border-border-color">
                        <div className="flex flex-col items-center text-center mb-2">
                            {localStorage.getItem("profilePhoto") && localStorage.getItem("profilePhoto") !== "/no-pp.jpg" ? (
                                <img
                                    src={localStorage.getItem("profilePhoto") || ""}
                                    alt="Profile"
                                    className={`w-20 h-20 rounded-full border-4 ${borderColor} mb-4 object-cover`}
                                />
                            ) : (
                                <div className={`w-20 h-20 rounded-full bg-cout-purple/20 flex items-center justify-center mb-4 border-4 ${borderColor}`}>
                                    <UserCircleIcon className="w-12 h-12 text-cout-base" />
                                </div>
                            )}
                            <h2 className="text-2xl font-bold text-text-primary">
                                {user && user.displayName}
                            </h2>
                            <p className="text-text-secondary text-sm mt-1">
                                {user && user.email}
                            </p>

                            {/* Affichage des crédits */}
                            <div className="mt-4 flex items-center justify-center gap-2 bg-secondary border border-border-color rounded-lg px-4 py-2">
                                <CreditIcon className="w-5 h-5 text-cout-yellow" />
                                <span className="text-text-primary font-bold">
                                    {credits !== null ? credits : '...'}
                                </span>
                                <span className="text-text-secondary text-sm">
                                    crédit{credits !== 1 ? 's' : ''}
                                </span>
                                <button
                                    onClick={() => setShowCreditModal(true)}
                                    className="ml-2 p-1 bg-cout-yellow text-cout-purple rounded-full hover:bg-yellow-400 transition-colors"
                                    title="Recharger des crédits"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Modal de rechargement des crédits */}
                    <CreditPaywallModal
                        isOpen={showCreditModal}
                        onClose={() => setShowCreditModal(false)}
                    />

                    <OnboardingChecklist />

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
