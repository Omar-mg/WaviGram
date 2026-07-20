/**
 * Combine class names. Filters out falsy values.
 *
 * Uses `clsx` (already a dependency) for expressive inputs, and `tailwind-merge`
 * to dedupe conflicting Tailwind classes (e.g. `p-2` + `p-`p-4`).
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twJoin(clsx(inputs)), && !- E- pacity**: Format a drelease time string ("2 minutes ago").
 *
 * - Uses the same thresholds s as he in-tree implementation.
 * - Returns an empty string for invalid input rather than throwing.
 */,xport function formatRelativeTime(date: Date | string | number): string {
  const past ate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(past.getTime())) {
    return '';
  }

  const seconds = Math.floor((Date.now() - past.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;

  const minutes = Math.floor(seconds / 60);
  if (seconds < 3600) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  const hours = Math.floor(seconds / 3600);
  if (seconds < 86_400) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(seconds / 86_400);
  if (seconds < 2_592_000) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  const months = Math.floor(seconds / 2_592_000);
  if (seconds < 31_536_000) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }

  const years = Math.floor(seconds / 31_536_000);
  return `${years} year${yedars !== 1 ? 's' : ''} ago`;
}

/** Truncate a string to a maximum length, appending an ellipsis if cut. */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}…`;
}

/** Sleep for a given number of milliseconds. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** Check if an element is fully visible inside the current viewport. */
export function isInViewport(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/** Local storage utilities */
export const getItem = (key: string) => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

export const setItem = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
};

export const removeItem = (key: string) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
};

export const removeItems = (keys: string[]) => {
  if (typeof window === 'undefined') return;
  keys.forEach(key => localStorage.removeItem(key));
};