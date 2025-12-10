import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    OAuthProvider,
    FacebookAuthProvider,
    sendPasswordResetEmail,
} from 'firebase/auth';
import {
    Button,
    Input,
    Card,
    CardBody,
    CardFooter,
    Typography,
} from '@material-tailwind/react';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { auth } from '../api/authentication/firebase';
import useAuth from '../api/hooks/useAuth';
import { convertFirebaseUser } from '../api/authentication/convertFirebaseUser';
import Header from '../components/global/Header';
import BackendService from '../api/services/BackendService';
import SandboxService from '../api/services/SandboxService';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorMessages';
import { validatePassword, getPasswordStrengthText } from '../utils/passwordValidation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { UserRole } from '../api/interfaces/users/UserInterface';
import { usePostHog } from '../contexts/PostHogContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { trackEvent, identify } = usePostHog();

    const from = (location.state as { from?: string })?.from || '/profile';

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [registerMode, setRegisterMode] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
    const [resetPasswordSuccess, setResetPasswordSuccess] = useState<string | null>(null);

    const passwordStrength = validatePassword(password);
    const passwordsMatch = password === confirmPassword;

    const linkAnonymousRecipeIfExists = async () => {
        const anonymousRecipeUuid = localStorage.getItem('anonymousRecipeUuid');
        if (anonymousRecipeUuid) {
            try {
                const result = await SandboxService.linkAnonymousRecipe(anonymousRecipeUuid);
                if (result.success) {
                    localStorage.removeItem('anonymousRecipeUuid');
                    console.log('Recette liée avec succès');
                } else if (result.error === 'INSUFFICIENT_CREDITS') {
                    console.warn('Quota insuffisant pour associer cette recette');
                } else if (result.alreadyLinked) {
                    localStorage.removeItem('anonymousRecipeUuid');
                    console.log('Recette déjà liée');
                }
            } catch (err) {
                console.error('Erreur lors de la liaison de la recette:', err);
            }
        }
    };

    const handleModeSwitch = (newMode: boolean) => {
        setRegisterMode(newMode);
        setPassword('');
        setConfirmPassword('');
        setError(null);
        setResetPasswordSuccess(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setPasswordTouched(false);
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let userData;

            if (Capacitor.isNativePlatform()) {
                console.log('Starting native Email Sign-In...');
                const result = await FirebaseAuthentication.signInWithEmailAndPassword({ email, password });
                console.log('Native email sign-in result user:', result.user?.email);

                if (result.user) {
                    localStorage.removeItem('userLoggedOut');

                    const idTokenResult = await FirebaseAuthentication.getIdToken();

                    localStorage.setItem('firebaseIdToken', idTokenResult.token || "");
                    localStorage.setItem('email', result.user.email || "");
                    localStorage.setItem('profilePhoto', result.user.photoUrl || "/no-pp.jpg");

                    userData = {
                        uid: result.user.uid,
                        email: result.user.email || "",
                        displayName: result.user.displayName || result.user.email?.split('@')[0] || "Utilisateur",
                        token: idTokenResult.token,
                        provider: "email" as const,
                        role: "MEMBER" as any,
                        isPremium: false,
                        createdAt: new Date(),
                        profilePhoto: result.user.photoUrl || "/no-pp.jpg"
                    };

                    try {
                        const backendUser = await BackendService.connectUser(
                            userData.email,
                            idTokenResult.token || ""
                        );
                        userData.role = backendUser.role;
                        userData.isPremium = backendUser.isPremium;
                    } catch (err) {
                        console.warn('Backend sync failed, using default values');
                    }
                } else {
                    throw new Error('Échec de la connexion par email');
                }
            } else {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);

                localStorage.removeItem('userLoggedOut');

                userData = await convertFirebaseUser(userCredential.user);
                localStorage.setItem('firebaseIdToken', userData.token ? userData.token : "");
                localStorage.setItem('email', userData.email ? userData.email : "");
                localStorage.setItem('profilePhoto', userData.profilePhoto ? userData.profilePhoto : "/no-pp.jpg");
            }

            login(userData);

            await linkAnonymousRecipeIfExists();

            identify(userData.uid, {
                email: userData.email,
                provider: 'email',
                role: userData.role,
                isPremium: userData.isPremium,
            });

            trackEvent('user_logged_in', {
                method: 'email',
                from: from,
            });

            navigate(from, { replace: true });

        } catch (err: unknown) {
            setError(getFirebaseErrorMessage(err));
        }
        setLoading(false);
    };

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!passwordStrength.isValid) {
            setError('Le mot de passe ne respecte pas tous les critères de sécurité.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            // Supprimer le flag de déconnexion volontaire
            localStorage.removeItem('userLoggedOut');

            localStorage.setItem('firebaseIdToken', token);
            localStorage.setItem('email', userCredential.user.email || "");
            localStorage.setItem('profilePhoto', userCredential.user.photoURL || "/no-pp.jpg");

            let userData;
            let retryCount = 0;
            const maxRetries = 4;
            const retryDelay = 1500;

            while (retryCount < maxRetries) {
                try {
                    if (retryCount > 0) {
                        console.log(`Nouvelle tentative dans ${retryDelay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, retryDelay));
                    }
                    userData = await BackendService.connectUser(
                        userCredential.user.email || "",
                        token
                    );
                    console.log('✅ Connexion au backend réussie');
                    break;
                } catch (err) {
                    retryCount++;
                    console.warn(`Tentative ${retryCount}/${maxRetries} de connexion au backend échouée`);
                    if (retryCount >= maxRetries) {
                        console.error('Échec de la connexion au backend après plusieurs tentatives');
                        userData = {
                            uid: userCredential.user.uid,
                            email: userCredential.user.email || "",
                            displayName: userCredential.user.displayName || userCredential.user.email?.split('@')[0] || "Utilisateur",
                            token: token,
                            provider: "email" as const,
                            role: UserRole.MEMBER,
                            isPremium: false,
                            createdAt: new Date(),
                            profilePhoto: userCredential.user.photoURL || "/no-pp.jpg"
                        };
                    }
                }
            }

            login(userData);

            await linkAnonymousRecipeIfExists();

            identify(userData!.uid, {
                email: userData!.email,
                provider: 'email',
                role: userData!.role,
                isPremium: userData!.isPremium,
            });

            trackEvent('user_signed_up', {
                method: 'email',
            });

            trackEvent('user_logged_in', {
                method: 'email',
                from: from,
            });

            navigate(from, { replace: true });
        } catch (err: unknown) {
            setError(getFirebaseErrorMessage(err));
        }
        setLoading(false);
    }

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Veuillez entrer votre adresse email.');
            return;
        }

        setLoading(true);
        setError(null);
        setResetPasswordSuccess(null);

        try {
            await sendPasswordResetEmail(auth, email);
            setResetPasswordSuccess('Un email de réinitialisation a été envoyé à votre adresse email. ⚠️ Vérifiez vos spams si vous ne le trouvez pas.');
        } catch (err: unknown) {
            setError(getFirebaseErrorMessage(err));
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            let userCredential;

            if (Capacitor.isNativePlatform()) {
                // Sur iOS/Android natif, utiliser le plugin Capacitor Firebase
                console.log('Starting native Google Sign-In...');
                const result = await FirebaseAuthentication.signInWithGoogle();
                console.log('Native sign-in result user:', result.user?.email);
                console.log('Native sign-in has credential:', !!result.credential);
                console.log('Native sign-in has idToken:', !!result.credential?.idToken);

                if (result.user) {
                    // L'utilisateur est connecté via Firebase natif
                    // Supprimer le flag de déconnexion volontaire
                    localStorage.removeItem('userLoggedOut');

                    // Récupérer le Firebase ID Token pour le backend
                    const idTokenResult = await FirebaseAuthentication.getIdToken();

                    // Stocker les infos pour le backend
                    localStorage.setItem('firebaseIdToken', idTokenResult.token || "");
                    localStorage.setItem('email', result.user.email || "");
                    localStorage.setItem('profilePhoto', result.user.photoUrl || "/no-pp.jpg");

                    // Créer userData manuellement depuis le résultat natif
                    const userData = {
                        uid: result.user.uid,
                        email: result.user.email || "",
                        displayName: result.user.displayName || result.user.email?.split('@')[0] || "Utilisateur",
                        token: idTokenResult.token,
                        provider: "google" as const,
                        role: "MEMBER" as any,
                        isPremium: false,
                        createdAt: new Date(),
                        profilePhoto: result.user.photoUrl || "/no-pp.jpg"
                    };

                    // Appeler le backend pour synchroniser l'utilisateur
                    try {
                        const backendUser = await BackendService.connectUser(
                            userData.email,
                            idTokenResult.token || ""
                        );
                        userData.role = backendUser.role;
                        userData.isPremium = backendUser.isPremium;
                    } catch (err) {
                        console.warn('Backend sync failed, using default values');
                    }

                    login(userData);

                    await linkAnonymousRecipeIfExists();

                    identify(userData.uid, {
                        email: userData.email,
                        provider: 'google',
                        role: userData.role,
                        isPremium: userData.isPremium,
                    });

                    trackEvent('user_logged_in', {
                        method: 'google',
                        from: from,
                    });

                    navigate(from, { replace: true });
                    setLoading(false);
                    return;
                } else {
                    throw new Error('Échec de la connexion Google');
                }
            } else {
                // Sur web, utiliser popup
                const provider = new GoogleAuthProvider();
                userCredential = await signInWithPopup(auth, provider);
            }

            // Supprimer le flag de déconnexion volontaire
            localStorage.removeItem('userLoggedOut');

            const userData = await convertFirebaseUser(userCredential.user);
            localStorage.setItem('firebaseIdToken', userData.token ? userData.token : "");
            localStorage.setItem('email', userData.email ? userData.email : "");
            localStorage.setItem('profilePhoto', userData.profilePhoto ? userData.profilePhoto : "/no-pp.jpg");

            login(userData);

            await linkAnonymousRecipeIfExists();

            identify(userData.uid, {
                email: userData.email,
                provider: 'google',
                role: userData.role,
                isPremium: userData.isPremium,
            });

            trackEvent('user_logged_in', {
                method: 'google',
                from: from,
            });

            navigate(from, { replace: true });
        } catch (err: unknown) {
            setError(getFirebaseErrorMessage(err));
        }
        setLoading(false);
    };

    const handleAppleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            let userCredential;

            if (Capacitor.isNativePlatform()) {
                console.log('Starting native Apple Sign-In...');
                const result = await FirebaseAuthentication.signInWithApple();
                console.log('Native Apple sign-in result user:', result.user?.email);

                if (result.user) {
                    localStorage.removeItem('userLoggedOut');

                    const idTokenResult = await FirebaseAuthentication.getIdToken();

                    localStorage.setItem('firebaseIdToken', idTokenResult.token || "");
                    localStorage.setItem('email', result.user.email || "");
                    localStorage.setItem('profilePhoto', result.user.photoUrl || "/no-pp.jpg");

                    const userData = {
                        uid: result.user.uid,
                        email: result.user.email || "",
                        displayName: result.user.displayName || result.user.email?.split('@')[0] || "Utilisateur",
                        token: idTokenResult.token,
                        provider: "apple" as const,
                        role: "MEMBER" as any,
                        isPremium: false,
                        createdAt: new Date(),
                        profilePhoto: result.user.photoUrl || "/no-pp.jpg"
                    };

                    try {
                        const backendUser = await BackendService.connectUser(
                            userData.email,
                            idTokenResult.token || ""
                        );
                        userData.role = backendUser.role;
                        userData.isPremium = backendUser.isPremium;
                    } catch (err) {
                        console.warn('Backend sync failed, using default values');
                    }

                    login(userData);

                    await linkAnonymousRecipeIfExists();

                    identify(userData.uid, {
                        email: userData.email,
                        provider: 'apple',
                        role: userData.role,
                        isPremium: userData.isPremium,
                    });

                    trackEvent('user_logged_in', {
                        method: 'apple',
                        from: from,
                    });

                    navigate(from, { replace: true });
                    setLoading(false);
                    return;
                } else {
                    throw new Error('Échec de la connexion Apple');
                }
            } else {
                const provider = new OAuthProvider('apple.com');
                provider.addScope('email');
                provider.addScope('name');
                userCredential = await signInWithPopup(auth, provider);
            }

            localStorage.removeItem('userLoggedOut');

            const userData = await convertFirebaseUser(userCredential.user);
            localStorage.setItem('firebaseIdToken', userData.token ? userData.token : "");
            localStorage.setItem('email', userData.email ? userData.email : "");
            localStorage.setItem('profilePhoto', userData.profilePhoto ? userData.profilePhoto : "/no-pp.jpg");

            login(userData);

            await linkAnonymousRecipeIfExists();

            identify(userData.uid, {
                email: userData.email,
                provider: 'apple',
                role: userData.role,
                isPremium: userData.isPremium,
            });

            trackEvent('user_logged_in', {
                method: 'apple',
                from: from,
            });

            navigate(from, { replace: true });
        } catch (err: unknown) {
            setError(getFirebaseErrorMessage(err));
        }
        setLoading(false);
    };

    const handleFacebookLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            let userCredential;

            if (Capacitor.isNativePlatform()) {
                console.log('Starting native Facebook Sign-In...');
                const result = await FirebaseAuthentication.signInWithFacebook();
                console.log('Native Facebook sign-in result user:', result.user?.email);

                if (result.user) {
                    localStorage.removeItem('userLoggedOut');

                    const idTokenResult = await FirebaseAuthentication.getIdToken();

                    localStorage.setItem('firebaseIdToken', idTokenResult.token || "");
                    localStorage.setItem('email', result.user.email || "");
                    localStorage.setItem('profilePhoto', result.user.photoUrl || "/no-pp.jpg");

                    const userData = {
                        uid: result.user.uid,
                        email: result.user.email || "",
                        displayName: result.user.displayName || result.user.email?.split('@')[0] || "Utilisateur",
                        token: idTokenResult.token,
                        provider: "facebook" as const,
                        role: "MEMBER" as any,
                        isPremium: false,
                        createdAt: new Date(),
                        profilePhoto: result.user.photoUrl || "/no-pp.jpg"
                    };

                    try {
                        const backendUser = await BackendService.connectUser(
                            userData.email,
                            idTokenResult.token || ""
                        );
                        userData.role = backendUser.role;
                        userData.isPremium = backendUser.isPremium;
                    } catch (err) {
                        console.warn('Backend sync failed, using default values');
                    }

                    login(userData);

                    await linkAnonymousRecipeIfExists();

                    identify(userData.uid, {
                        email: userData.email,
                        provider: 'facebook',
                        role: userData.role,
                        isPremium: userData.isPremium,
                    });

                    trackEvent('user_logged_in', {
                        method: 'facebook',
                        from: from,
                    });

                    navigate(from, { replace: true });
                    setLoading(false);
                    return;
                } else {
                    throw new Error('Échec de la connexion Facebook');
                }
            } else {
                const provider = new FacebookAuthProvider();
                provider.addScope('email');
                provider.addScope('public_profile');
                userCredential = await signInWithPopup(auth, provider);
            }

            localStorage.removeItem('userLoggedOut');

            const userData = await convertFirebaseUser(userCredential.user);
            localStorage.setItem('firebaseIdToken', userData.token ? userData.token : "");
            localStorage.setItem('email', userData.email ? userData.email : "");
            localStorage.setItem('profilePhoto', userData.profilePhoto ? userData.profilePhoto : "/no-pp.jpg");

            login(userData);

            await linkAnonymousRecipeIfExists();

            identify(userData.uid, {
                email: userData.email,
                provider: 'facebook',
                role: userData.role,
                isPremium: userData.isPremium,
            });

            trackEvent('user_logged_in', {
                method: 'facebook',
                from: from,
            });

            navigate(from, { replace: true });
        } catch (err: unknown) {
            setError(getFirebaseErrorMessage(err));
        }
        setLoading(false);
    };

    const [isMobile, setIsMobile] = useState(false);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    // Refs pour les inputs (navigation clavier et scroll)
    const emailInputRef = useRef<HTMLInputElement>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);
    const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

    // Fonction pour scroller l'input au-dessus du clavier
    const handleInputFocus = (element: HTMLElement | null) => {
        setIsKeyboardOpen(true);
        if (element && Capacitor.isNativePlatform()) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    };

    const handleInputBlur = () => {
        // Petit délai pour éviter le clignotement lors du passage d'un input à l'autre
        setTimeout(() => {
            if (document.activeElement?.tagName !== 'INPUT') {
                setIsKeyboardOpen(false);
            }
        }, 100);
    };

    // Navigation entre les champs
    const focusNextInput = (currentField: 'email' | 'password' | 'confirmPassword') => {
        if (currentField === 'email') {
            passwordInputRef.current?.focus();
        } else if (currentField === 'password' && registerMode) {
            confirmPasswordInputRef.current?.focus();
        }
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className={`flex flex-col bg-bg-color ${isMobile ? 'mobile-content-with-header' : 'mt-4 md:mt-0 p-6 rounded-md'}`}>
            <LoginHeader isMobile={isMobile} />
            <div className={`flex-1 ${isMobile ? `overflow-y-auto px-4 ${isKeyboardOpen ? 'pb-[300px]' : 'pb-8'}` : ''}`}>
                <div className={`flex items-center justify-center ${isMobile ? 'min-h-full py-4' : 'mt-4'}`}>
                    <Card className="w-full max-w-md p-4 shadow-lg" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                    <CardBody className="flex flex-col gap-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                        <Typography variant="h4" className="text-center" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                            {registerMode ? "Inscription" : "Connexion"}
                        </Typography>

                        {error && (
                            <Typography color="red" className="text-center" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                {error}
                            </Typography>
                        )}

                        {resetPasswordSuccess && (
                            <Typography color="green" className="text-center" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                {resetPasswordSuccess}
                            </Typography>
                        )}

                        {!registerMode && (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    Se connecter avec Google
                                </button>
                                <button
                                    onClick={handleAppleLogin}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-black hover:bg-gray-900 text-white font-semibold rounded-lg border-2 border-black transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                                    </svg>
                                    Se connecter avec Apple
                                </button>
                                <button
                                    onClick={handleFacebookLogin}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-semibold rounded-lg border-2 border-[#1877F2] hover:border-[#166FE5] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    Se connecter avec Facebook
                                </button>
                                <Typography variant="small" className="text-center text-gray-500" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                    ou
                                </Typography>
                            </div>
                        )}

                        <form onSubmit={registerMode ? handleEmailRegister : handleEmailLogin} className="flex flex-col gap-4">
                            <Input
                                type="email"
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={(e) => handleInputFocus(e.target)}
                                onBlur={handleInputBlur}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        focusNextInput('email');
                                    }
                                }}
                                inputRef={emailInputRef}
                                inputMode="email"
                                autoComplete="email"
                                enterKeyHint="next"
                                required
                                onPointerEnterCapture={undefined}
                                onPointerLeaveCapture={undefined}
                                crossOrigin={undefined}
                            />

                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    label="Mot de passe"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (registerMode && !passwordTouched) {
                                            setPasswordTouched(true);
                                        }
                                    }}
                                    onFocus={(e) => handleInputFocus(e.target)}
                                    onBlur={handleInputBlur}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            if (registerMode) {
                                                e.preventDefault();
                                                focusNextInput('password');
                                            }
                                        }
                                    }}
                                    inputRef={passwordInputRef}
                                    autoComplete={registerMode ? "new-password" : "current-password"}
                                    enterKeyHint={registerMode ? "next" : "done"}
                                    required
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                    crossOrigin={undefined}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                            {registerMode && (
                                <>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            label="Confirmer le mot de passe"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            onFocus={(e) => handleInputFocus(e.target)}
                                            onBlur={handleInputBlur}
                                            inputRef={confirmPasswordInputRef}
                                            autoComplete="new-password"
                                            enterKeyHint="done"
                                            required
                                            onPointerEnterCapture={undefined}
                                            onPointerLeaveCapture={undefined}
                                            crossOrigin={undefined}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors"
                                            aria-label={showConfirmPassword ? "Masquer la confirmation" : "Afficher la confirmation"}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeSlashIcon className="h-5 w-5" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>

                                    {confirmPassword && !passwordsMatch && (
                                        <Typography variant="small" color="red" className="flex items-center gap-1" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                            ✗ Les mots de passe ne correspondent pas
                                        </Typography>
                                    )}

                                    {passwordTouched && (
                                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                            <Typography variant="small" className={`font-semibold ${getPasswordStrengthText(passwordStrength).color}`} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                                Force du mot de passe : {getPasswordStrengthText(passwordStrength).text}
                                            </Typography>
                                            <div className="space-y-1">
                                                <Typography variant="small" className={passwordStrength.hasMinLength ? "text-green-600" : "text-gray-600"} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                                    {passwordStrength.hasMinLength ? "✓" : "○"} Au moins 8 caractères
                                                </Typography>
                                                <Typography variant="small" className={passwordStrength.hasUpperCase ? "text-green-600" : "text-gray-600"} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                                    {passwordStrength.hasUpperCase ? "✓" : "○"} Une lettre majuscule
                                                </Typography>
                                                <Typography variant="small" className={passwordStrength.hasLowerCase ? "text-green-600" : "text-gray-600"} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                                    {passwordStrength.hasLowerCase ? "✓" : "○"} Une lettre minuscule
                                                </Typography>
                                                <Typography variant="small" className={passwordStrength.hasNumber ? "text-green-600" : "text-gray-600"} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                                    {passwordStrength.hasNumber ? "✓" : "○"} Un chiffre
                                                </Typography>
                                                <Typography variant="small" className={passwordStrength.hasSpecialChar ? "text-green-600" : "text-gray-600"} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                                    {passwordStrength.hasSpecialChar ? "✓" : "○"} Un caractère spécial (!@#$%^&*...)
                                                </Typography>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {!registerMode && (
                                <div className="text-right -mt-2">
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        disabled={loading}
                                        className="text-blue-500 hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Mot de passe oublié ?
                                    </button>
                                </div>
                            )}

                            {registerMode ? (
                                <Button
                                    type="submit"
                                    disabled={loading || !passwordStrength.isValid || !passwordsMatch}
                                    fullWidth
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    fullWidth
                                    placeholder={undefined}
                                    onPointerEnterCapture={undefined}
                                    onPointerLeaveCapture={undefined}
                                >
                                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                                </Button>
                            )}
                        </form>

                    </CardBody>
                    {!registerMode && (
                        <CardFooter className="text-center" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                            <Typography variant="small" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                Vous n'avez pas de compte ?{' '}
                                <button
                                    className="text-blue-500 hover:underline"
                                    onClick={() => handleModeSwitch(true)}
                                >
                                    S'inscrire
                                </button>
                            </Typography>
                        </CardFooter>
                    )}
                    {registerMode && (
                        <CardFooter className="text-center" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                            <Typography variant="small" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                Vous avez déjà un compte ?{' '}
                                <button
                                    className="text-blue-500 hover:underline"
                                    onClick={() => handleModeSwitch(false)}
                                >
                                    Se connecter
                                </button>
                            </Typography>
                        </CardFooter>
                    )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

function LoginHeader({ isMobile }: { isMobile: boolean }) {
    return (
        <Header
            back={true}
            home={true}
            title={!isMobile}
            profile={false}
            pageName={isMobile ? "Connexion" : undefined}
        />
    )
}
