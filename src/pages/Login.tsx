import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from 'firebase/auth';
import {
    Button,
    Input,
    Card,
    CardBody,
    CardFooter,
    Typography,
} from '@material-tailwind/react';
import { auth } from '../api/authentication/firebase';
import useAuth from '../api/hooks/useAuth';
import { convertFirebaseUser } from '../api/authentication/convertFirebaseUser';
import Header from '../components/global/Header';
import RecipeService from '../api/services/RecipeService';
import BackendService from '../api/services/BackendService';
import SandboxService from '../api/services/SandboxService';
import { useRecipeContext } from '../contexts/RecipeContext';
import { getFirebaseErrorMessage } from '../utils/firebaseErrorMessages';
import { validatePassword, getPasswordStrengthText } from '../utils/passwordValidation';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { UserRole } from '../api/interfaces/users/UserInterface';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { setRecipes } = useRecipeContext();

    const from = (location.state as { from?: string })?.from || '/myrecipes';

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [registerMode, setRegisterMode] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [passwordTouched, setPasswordTouched] = useState<boolean>(false);

    const passwordStrength = validatePassword(password);
    const passwordsMatch = password === confirmPassword;

    const handleModeSwitch = (newMode: boolean) => {
        setRegisterMode(newMode);
        setPassword('');
        setConfirmPassword('');
        setError(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
        setPasswordTouched(false);
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            const userData = await convertFirebaseUser(userCredential.user);
            localStorage.setItem('firebaseIdToken', userData.token ? userData.token : "");
            localStorage.setItem('email', userData.email ? userData.email : "");
            localStorage.setItem('profilePhoto', userData.profilePhoto ? userData.profilePhoto : "/no-pp.jpg");

            login(userData);

            const recipes = await RecipeService.fetchRecipesRemotly();
            setRecipes(recipes);

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

            const anonymousRecipeUuid = localStorage.getItem('anonymousRecipeUuid');
            if (anonymousRecipeUuid) {
                try {
                    const result = await SandboxService.linkAnonymousRecipe(anonymousRecipeUuid);

                    if (result.success) {
                        localStorage.removeItem('anonymousRecipeUuid');
                        console.log('✅ Recette liée avec succès');
                    } else if (result.error === 'INSUFFICIENT_CREDITS') {
                        console.warn('Quota insuffisant pour associer cette recette');
                    } else if (result.alreadyLinked) {
                        localStorage.removeItem('anonymousRecipeUuid');
                        console.log('ℹ️ Recette déjà liée');
                    }
                } catch (err) {
                    console.error('Erreur lors de la liaison de la recette:', err);
                }
            }

            try {
                const recipes = await RecipeService.fetchRecipesRemotly();
                setRecipes(recipes);
            } catch (err) {
                console.error('Erreur lors de la récupération des recettes:', err);
                setRecipes([]);
            }

            navigate(from, { replace: true });
        } catch (err: unknown) {
            setError(getFirebaseErrorMessage(err));
        }
        setLoading(false);
    }

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);

            const userData = await convertFirebaseUser(userCredential.user);
            localStorage.setItem('firebaseIdToken', userData.token ? userData.token : "");
            localStorage.setItem('email', userData.email ? userData.email : "");
            localStorage.setItem('profilePhoto', userData.profilePhoto ? userData.profilePhoto : "/no-pp.jpg");

            login(userData);

            const recipes = await RecipeService.fetchRecipesRemotly();
            setRecipes(recipes);

            navigate(from, { replace: true });
        } catch (err: unknown) {
            setError(getFirebaseErrorMessage(err));
        }
        setLoading(false);
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className='mt-4 md:mt-0 flex flex-col bg-bg-color p-6 rounded-md'>
            {isMobile ? null : <LoginHeader />}
            <div className="flex items-center justify-center mt-4">
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

                        {!registerMode && (
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                    </svg>
                                    Se connecter avec Google
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
    );
};

function LoginHeader() {
    return (
        <Header
            back={true}
            home={true}
            title={true}
            profile={false}
        />
    )
}
