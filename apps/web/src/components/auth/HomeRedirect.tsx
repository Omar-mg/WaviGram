import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

/**
 * Tiny redirect used as the public landing route.
 *
 * - Logged-in users land on the dashboard.
 * - Logged-out users land on the login page.
 */
export const HomeRedirect = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};
