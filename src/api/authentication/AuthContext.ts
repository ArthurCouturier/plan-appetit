import { createContext } from 'react';
import AuthContextInterface from '../interfaces/users/AuthContextInterface';

export const AuthContext = createContext<AuthContextInterface | null>(null);
