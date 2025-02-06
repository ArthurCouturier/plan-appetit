import { SetStateAction, useState } from 'react';
import UserInterface from '../../api/interfaces/users/UserInterface';
import { AuthContext } from '../../api/authentication/authContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserInterface | null>(null);

    const login = (userData: SetStateAction<UserInterface | null>) => setUser(userData);
    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
