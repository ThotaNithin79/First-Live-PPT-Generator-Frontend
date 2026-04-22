import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    // Show a blank screen or a spinner while checking auth status
    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    // If not logged in, redirect to login page
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If logged in but doesn't have the required role, redirect to a safe page (e.g., dashboard)
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // If authorized, render the child components (the actual page)
    return <Outlet />;
};

export default ProtectedRoute;