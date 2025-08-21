import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from "uuid";
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

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [registerMode, setRegisterMode] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

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

            await RecipeService.fetchRecipesRemotly();

            navigate('/profile');

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error happened');
        }
        setLoading(false);
    };

    const handleEmailRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            if (userCredential.user.email) {
                await BackendService.registerNewUser(
                    {
                        email: userCredential.user.email,
                        displayName: userCredential.user.displayName || "",
                        profilePhoto: userCredential.user.photoURL || "",
                        uid: uuidv4().toString(),
                        provider: 'email',
                        isPremium: false,
                        createdAt: new Date(),
                    },
                    token
                );
            }

            const userData = await convertFirebaseUser(userCredential.user)
            localStorage.setItem('firebaseIdToken', userData.token ? userData.token : "");
            localStorage.setItem('email', userData.email ? userData.email : "");
            localStorage.setItem('profilePhoto', userData.profilePhoto ? userData.profilePhoto : "/no-pp.jpg");

            login(userData);
            await RecipeService.fetchRecipesRemotly();

            navigate('/profile');
        } catch (err: unknown) {

            setError(err instanceof Error ? err.message : 'An error happened');
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

            await RecipeService.fetchRecipesRemotly();

            navigate('/profile');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error happened');
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
            <div className="flex items-center justify-center">
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

                        <form onSubmit={registerMode ? handleEmailRegister : handleEmailLogin} className="flex flex-col gap-4">
                            <Input
                                type="email"
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined} />
                            <Input
                                type="password"
                                label="Mot de passe"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined} />
                            {registerMode ? (
                                <Button type="submit" disabled={loading} fullWidth placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                    {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                                </Button>
                            ) : (
                                <Button type="submit" disabled={loading} fullWidth placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                                </Button>
                            )}
                        </form>

                        {!registerMode && (
                            <Typography variant="small" className="text-center mt-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                ou
                            </Typography>
                        )}

                        {!registerMode && (
                            <div className="flex flex-col gap-2">
                                <Button
                                    variant="outlined"
                                    color="blue"
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    fullWidth placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}                        >
                                    Se connecter avec Google
                                </Button>
                            </div>
                        )}

                    </CardBody>
                    {!registerMode && (
                        <CardFooter className="text-center" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                            <Typography variant="small" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                Vous n'avez pas de compte ?{' '}
                                <button
                                    className="text-blue-500 hover:underline"
                                    onClick={() => setRegisterMode(true)}
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
                                    onClick={() => setRegisterMode(false)}
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
