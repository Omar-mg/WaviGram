import { Toaster as SonnerToaster } from 'sonner';

/**
 * Single canonical toast surface for the app.
 *
 * Use `toast.success`, `toast.error`, `toast.info`, `toast.message` from the
 * `sonner` package directly inside page/component code — there is no wrapper
 * hook. This component only renders the visual container.
 *
 * Theme is driven by Tailwind's `dark` class on the `<html>` element, which
 * sonner detects automatically when `theme="system"` is used in conjunction
 * with our explicit dark-mode toggle.
 */
export const Toaster = () => {
  return (
    <SonnerToaster
      theme="system"
      position="top-right"
      swipeDirection="right-to-left"
      closeButton
      richColors
      expand
    />
  );
};
