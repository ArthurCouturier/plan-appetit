import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../api/hooks/useAuth';
import AuthContextInterface from '../../api/interfaces/users/AuthContextInterface';

export default function ProtectedRoute() {
    const user: AuthContextInterface | null = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
