/**
 * Validate required environment variables.
 * Call this once at app startup.
 *
 * Behaviour:
 *  - Always logs missing optional variables (e.g. OAuth client IDs) to the console.
 *  - Throws only if a *required* variable is missing, and only in production.
 *  - In development, missing required variables are logged but do not crash the app.
 */
export const validateEnv = (): boolean => {
  const required: Record<string, string> = {
    VITE_API_URL: 'API base URL is required'
  };

  const optional: Record<string, string> = {
    VITE_GOOGLE_CLIENT_ID: 'Google OAuth client ID (only needed for Google sign-in)',
    VITE_APPLE_CLIENT_ID: 'Apple OAuth client ID (only needed for Apple sign-in)'
  };

  const missing: string[] = [];
  const missingOptional: string[] = [];

  for (const [key, message] of Object.entries(required)) {
    if (!import.meta.env[key]) {
      missing.push(`${key}: ${message}`);
    }
  }

  for (const [key, message] of Object.entries(optional)) {
    if (!import.meta.env[key]) {
      missingOptional.push(`${key}: ${message}`);
    }
  }

  if (missingOptional.length > 0) {
    // eslint-disable-next-line no-console
    console.info(
      '[WaviGram] Optional env vars not set (safe to ignore until features are wired up):'
    );
    missingOptional.forEach((msg) => {
      // eslint-disable-next-line no-console
      console.info(`  - ${msg}`);
    });
  }

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.error('[WaviGram] Missing required environment variables:');
    missing.forEach((msg) => {
      // eslint-disable-next-line no-console
      console.error(`  - ${msg}`);
    });

    if (import.meta.env.PROD) {
      throw new Error('Missing required environment variables');
    }
  }

  return missing.length === 0;
};

/** Get the API base URL with a sensible fallback for local development. */
export const getApiUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
};

/** Get the WebSocket URL with a sensible fallback for local development. */
export const getWsUrl = (): string => {
  return import.meta.env.VITE_WS_URL || 'ws://localhost:3000';
};

/** `true` when running Vite's dev server. */
export const isDevelopment = (): boolean => Boolean(import.meta.env.DEV);

/** `true` when running a production build. */
export const isProduction = (): boolean => Boolean(import.meta.env.PROD);
