import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../api/hooks/useAuth';
import PageLoader from '../global/PageLoader';

export default function ProtectedRoute() {
    const { user } = useAuth();
    const location = useLocation();

    if (user === undefined) {
        return <PageLoader />;
    }

    if (user === null) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return <Outlet />;
}
