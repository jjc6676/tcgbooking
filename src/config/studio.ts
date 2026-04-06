/**
 * Studio configuration — single source of truth for all studio-specific values.
 * Change these to rebrand or reconfigure the app.
 */

export const STUDIO = {
  /** Full studio name */
  name: "Keri Choplin Hair Studio",
  /** Short name for email headers, nav, etc. */
  shortName: "Keri Choplin Hair",
  /** Display name used in the "From" field of outgoing emails */
  senderName: "Keri Choplin",
  /** Owner's first name (used in conversational copy) */
  ownerName: "Keri",
  /** Monogram letter for email templates */
  monogramLetter: "K",
  /** Contact email (shown to clients) */
  contactEmail: "kerichoplin@gmail.com",
  /** City/state for footers */
  location: "Lafayette, Louisiana",
  /** IANA timezone */
  timezone: "America/Chicago",
  /** App URL (for email links) */
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://tcgbooking.vercel.app",
  /** Resend from email */
  fromEmail: process.env.RESEND_FROM_EMAIL ?? "hello@kerichoplinhair.com",
} as const;
