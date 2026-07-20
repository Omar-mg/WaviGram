import { useEffect } from "react";

/**
 * Hook to initialize analytics
 * In a real app, this would connect to services like Google Analytics, Mixpanel, etc.
 */
export const useAnalytics = () => {
  useEffect(() => {
    // Initialize analytics on mount
    // Example: Google Analytics
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('config', 'G-XXXXXXXXXX');
    // }

    // Track page view
    trackPageView();
  }, []);

  const trackPageView = () => {
    if (typeof window !== "undefined") {
      // In a real app, you would send this to your analytics provider
      console.log("Page view:", window.location.pathname);

      // Example for Google Analytics:
      // if (window.gtag) {
      //   window.gtag('event', 'page_view', {
      //     page_path: window.location.pathname,
      //     page_title: document.title
      //   });
      // }
    }
  };

  const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
    if (typeof window !== "undefined") {
      console.log(`Event: ${eventName}`, properties);

      // Example for Google Analytics:
      // if (window.gtag) {
      //   window.gtag('event', eventName, parameters);
      // }
    }
  };

  return {
    trackPageView,
    trackEvent,
  };
};