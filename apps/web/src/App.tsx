import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Toaster } from '@/components/ui/Toaster';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { FullScreenSpinner } from '@/components/ui/FullScreenSpinner';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireGuest } from '@/components/auth/RequireGuest';
import { HomeRedirect } from '@/components/auth/HomeRedirect';
import { DashboardLayout } from '@/layouts/DashboardLayout';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

import { initializeAuth } from '@/store/auth';

const ErrorFallback = ({ resetError }: { error: Error; resetError: () => void }) => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 text-center dark:bg-gray-900">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Something went wrong</h1>
    <p className="mt-2 max-w-md text-base text-gray-600 dark:text-gray-400">
      We&apos;ve encountered an unexpected error. Please try again, or come back in a moment.
    </p>
    <button
      type="button"
      onClick={resetError}
      className="mt-6 inline-flex items-center justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      Try again
    </button>
  </div>
);

const App = () => {
  const [hydrated, setHydrated] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Initialize auth state from localStorage
    initializeAuth()
      .finally(() => {
        setInitializing(false);
        setHydrated(true);
      });
  }, []);

  if (initializing) {
    return <FullScreenSpinner />;
  }

  if (!hydrated) {
    return <FullScreenSpinner />;
  }

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Guest-only */}
          <Route element={<RequireGuest />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Authenticated */}
          <Route element={<RequireAuth />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Messages routes */}
              <Route path="/messages" element={<MessagesRoutes />} />
              {/* Friends route - placeholder */}
              <Route path="/friends" element={<div>Friends coming soon...</div>} />
              {/* Posts route - placeholder */}
              <Route path="/posts" element={<div>Posts coming soon...</div>} />
              {/* Stories route - placeholder */}
              <Route path="/stories" element={<div>Stories coming soon...</div>} />
              {/* Settings route - placeholder */}
              <Route path="/settings" element={<div>Settings coming soon...</div>} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;