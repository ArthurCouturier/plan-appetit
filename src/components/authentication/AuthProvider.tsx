import { SetStateAction, useEffect, useState } from 'react';
import UserInterface from '../../api/interfaces/users/UserInterface';
import { AuthContext } from '../../api/authentication/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { convertFirebaseUser } from '../../api/authentication/convertFirebaseUser';
import { auth } from '../../api/authentication/firebase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserInterface | null | undefined>(undefined);

    const login = (userData: SetStateAction<UserInterface | null | undefined>) => setUser(userData);
    const logout = () => setUser(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(await convertFirebaseUser(firebaseUser));
            } else {
                setUser(null);
            }
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
