import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    OAuthProvider,
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

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            login(convertFirebaseUser(userCredential.user));
            navigate('/profile');

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error happened');
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            login(convertFirebaseUser(userCredential.user));
            navigate('/profile');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error happened');
        }
        setLoading(false);
    };

    const handleFacebookLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const provider = new FacebookAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            login(convertFirebaseUser(userCredential.user));
            navigate('/profile');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error happened');
        }
        setLoading(false);
    };

    const handleAppleLogin = async () => {
        setLoading(true);
        setError(null);

        try {
            const provider = new OAuthProvider('apple.com');
            const userCredential = await signInWithPopup(auth, provider);
            login(convertFirebaseUser(userCredential.user));
            navigate('/profile');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error happened');
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-bg-color">
            <Card className="w-full max-w-md p-4 shadow-lg" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                <CardBody className="flex flex-col gap-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                    <Typography variant="h4" className="text-center" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                        Connexion
                    </Typography>

                    {error && (
                        <Typography color="red" className="text-center" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                            {error}
                        </Typography>
                    )}

                    <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
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
                        <Button type="submit" disabled={loading} fullWidth placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                        </Button>
                    </form>

                    <Typography variant="small" className="text-center mt-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                        ou
                    </Typography>

                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outlined"
                            color="blue"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            fullWidth placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}                        >
                            Se connecter avec Google
                        </Button>
                        <Button
                            variant="outlined"
                            color="blue-gray"
                            onClick={handleFacebookLogin}
                            disabled={loading}
                            fullWidth placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}                        >
                            Se connecter avec Facebook
                        </Button>
                        <Button
                            variant="outlined"
                            color="gray"
                            onClick={handleAppleLogin}
                            disabled={loading}
                            fullWidth placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}                        >
                            Se connecter avec Apple
                        </Button>
                    </div>
                </CardBody>
                <CardFooter className="text-center" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                    <Typography variant="small" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                        Vous n'avez pas de compte ?{' '}
                        <a href="/register" className="text-blue-500 hover:underline">
                            S'inscrire
                        </a>
                    </Typography>
                </CardFooter>
            </Card>
        </div>
    );
};
