import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../api/hooks/useAuth';

export default function ProtectedRoute() {
    const { user } = useAuth();
    const location = useLocation();

    if (user === undefined) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-bg-color">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cout-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-cout-purple font-semibold">Chargement...</p>
                </div>
            </div>
        );
    }

    if (user === null) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <Outlet />;
}
