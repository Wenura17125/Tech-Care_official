import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleBasedRedirect = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="p-4 text-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect users to their profile page instead of dashboard
    // This fixes the issue where clicking "Profile" was redirecting to dashboard
    switch (user.role) {
        case 'admin':
            return <Navigate to="/admin" replace />;
        case 'technician':
            return <Navigate to="/profile" replace />;
        case 'user':
        default:
            return <Navigate to="/profile" replace />;
    }
};

export default RoleBasedRedirect;
