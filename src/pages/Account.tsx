import React, { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardFooter, Input, Typography } from '@material-tailwind/react';
import { updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../api/authentication/firebase';
import useAuth from '../api/hooks/useAuth';
import Header from '../components/global/Header';

export default function Account() {
    const { user, logout } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user === null) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (user === undefined) {
        return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
    }

    const handleLogout = async () => {
        localStorage.removeItem('firebaseIdToken');
        localStorage.removeItem('profilePhoto');
        localStorage.removeItem('email');
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

    return (
        <div className='flex flex-col bg-bg-color p-6 rounded-md h-[92vh]'>
            <AccountHeader />
            <div className="flex justify-center items-center size-full rounded-md">
                <Card className="w-full max-w-md p-4 shadow-lg" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                    <CardBody className="flex flex-col gap-4" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                        <div className="flex flex-col items-center">
                            {/* <Avatar
                            src={(user: UserInterface).photoURL || 'https://via.placeholder.com/150'}
                            alt={user.displayName}
                            size="lg" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} /> */}
                            <Typography variant="h5" className="mt-2" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                {user && user.displayName}
                            </Typography>
                            <Typography variant="small" className="text-gray-600" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                {user && user.email}
                            </Typography>
                        </div>
                        {error && <Typography color="red" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>{error}</Typography>}
                        {message && <Typography color="green" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>{message}</Typography>}
                        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                            <Input
                                type="password"
                                label="Nouveau mot de passe"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined} crossOrigin={undefined} />
                            <Button type="submit" disabled={loading} fullWidth placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                                {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
                            </Button>
                        </form>
                    </CardBody>
                    <CardFooter className="flex justify-center" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                        <Button variant="outlined" color="red" onClick={handleLogout} fullWidth placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                            Se déconnecter
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

function AccountHeader() {
    return (
        <Header
            back={true}
            home={true}
            title={true}
            pageName={"Mon compte"}
        />
    )
}
