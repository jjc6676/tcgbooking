import { STUDIO } from "@/config/studio";

/**
 * Shared formatting utilities
 */

/**
 * Format ISO date to time string (e.g., "9:30 AM")
 */
export function formatTime(iso: string, options?: { timeZone?: string }): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: options?.timeZone ?? STUDIO.timezone,
  });
}

/**
 * Format appointment time (e.g., "9:30 AM").
 *
 * NOTE on storage convention: appointment `start_at` / `end_at` are `timestamptz`
 * in Postgres, but the booking write path stores Central wall-clock time labeled
 * as UTC (i.e. an 11:30 AM Central booking is persisted as `...T11:30:00Z`).
 * Formatting with `timeZone: "UTC"` reads back the original Central wall clock.
 *
 * Use this helper (not `formatTime` above) for any appointment `start_at`/`end_at`.
 * `formatTime` applies `STUDIO.timezone` ("America/Chicago") and will double-shift,
 * producing a time 5–6 hours earlier than intended.
 *
 * TODO: once the booking write path is migrated to store real UTC, collapse this
 * into `formatTime` with the studio timezone and update call sites.
 */
export function formatTimeUTC(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

/**
 * Format duration in minutes to human-readable string (e.g., "1h 30m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Format cents to display string (e.g., "$150")
 */
export function formatCents(cents: number, options?: { decimals?: boolean }): string {
  if (options?.decimals) {
    return `$${(cents / 100).toFixed(2)}`;
  }
  return `$${(cents / 100).toFixed(0)}`;
}

/**
 * Format ISO date to short date string (e.g., "Mon, Mar 15")
 */
export function formatDateShort(iso: string, options?: { timeZone?: string }): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: options?.timeZone ?? "UTC",
  });
}

/**
 * Format ISO date to long date string (e.g., "Monday, March 15, 2026")
 */
export function formatDateLong(iso: string, options?: { timeZone?: string }): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: options?.timeZone ?? "UTC",
  });
}

/**
 * Format ISO date to full datetime string with timezone
 */
export function formatDateTime(iso: string, options?: { timeZone?: string }): string {
  const tz = options?.timeZone ?? STUDIO.timezone;
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
    timeZoneName: "short",
  });
}
