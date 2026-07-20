import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
          <AlertTriangle className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Page not found
        </h1>
        <p className="mb-6 text-base text-gray-600 dark:text-gray-400">
          We couldn&apos;t find the page you were looking for. It may have been moved or never existed.
        </p>
        <Link to="/">
          <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>Return home</Button>
        </Link>
      </div>
    </div>
  );
};
