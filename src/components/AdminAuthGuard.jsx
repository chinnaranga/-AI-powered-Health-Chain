import { Navigate, Outlet } from 'react-router-dom';

export default function AdminAuthGuard({ children }) {
    const isAdmin = localStorage.getItem('hc_admin') === 'true';

    if (!isAdmin) {
        return <Navigate to="/login/admin" replace />;
    }

    return children || <Outlet />;
}
