import { Navigate, Outlet } from 'react-router-dom';
import { AuthContextType } from './AuthProvider';
import useAuth from '../../api/hooks/useAuth';

export default function ProtectedRoute() {
    const user: AuthContextType | null = useAuth();

    console.log("user", user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
