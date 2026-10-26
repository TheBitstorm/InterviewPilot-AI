// src/utils/formatters.js
// Shared formatting helpers used across all pages.

/**
 * Format seconds into MM:SS display string.
 * Example: 125 → "02:05"
 */
export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/**
 * Format a score (0–10) as a percentage string.
 * Example: 7.5 → "75%"
 */
export const scoreToPercent = (score) => `${Math.round(score * 10)}%`;

/**
 * Truncate text to a given character limit.
 */
export const truncate = (text, limit = 120) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.slice(0, limit) + '…';
};

/**
 * Format a date string as "16 Aug 2026".
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Capitalize the first letter of a string.
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
