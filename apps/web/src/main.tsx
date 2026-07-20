import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { validateEnv } from './lib/env';

// Apply the persisted dark-mode preference *before* React renders, so the
// first paint matches the user's choice and there is no flash of light mode.
(() => {
  try {
    const stored = localStorage.getItem('wavigram-theme');
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = stored ? stored === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', isDark);
  } catch {
    // localStorage / matchMedia may be unavailable — fall through and the
    // app simply stays in light mode.
  }
})();

// Validate environment variables on app startup.
// This only throws in production builds when a *required* variable is missing.
validateEnv();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
