import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

/**
 * Route guard for guest-only routes (login, register, etc.).
 *
 * - If the user is NOT authenticated, renders the child route.
 * - If they are, redirects to /dashboard.
 */
export const RequireGuest = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
