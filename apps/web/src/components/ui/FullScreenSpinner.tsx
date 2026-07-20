/**
 * Full-screen loading surface used by the router while it rehydrates state
 * from localStorage. Kept tiny and dependency-free so it can render before
 * any other component mounts.
 */
export const FullScreenSpinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center gap-3 text-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600 dark:border-gray-700 dark:border-t-primary-400"
        role="status"
        aria-label="Loading"
      />
      <p className="text-sm text-gray-500 dark:text-gray-400">Loading WaviGram…</p>
    </div>
  </div>
);
