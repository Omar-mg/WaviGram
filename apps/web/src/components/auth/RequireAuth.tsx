import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

/**
 * Route guard for authenticated-only routes.
 *
 * - If the user is authenticated, renders the child route.
 * - If not, redirects to /login and remembers the requested path in router
 *   state, so login can send the user back where they came from.
 */
export const RequireAuth = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
};
