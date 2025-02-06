import { createContext, SetStateAction, useState } from 'react';
import USerInterface from '../../api/interfaces/users/UserInterface';
import UserInterface from '../../api/interfaces/users/UserInterface';

export interface AuthContextType {
    user: USerInterface | null;
    login: (userData: SetStateAction<null>) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Par exemple, 'user' est null si non connecté, ou contient des informations si connecté.
    const [user, setUser] = useState<UserInterface | null>(null);

    const login = (userData: SetStateAction<null>) => setUser(userData);
    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
