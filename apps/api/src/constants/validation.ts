/** ISO 4217 currency code, e.g. INR. */
export const CURRENCY_PATTERN = /^[A-Z]{3}$/;

/** Longest allowed merchant, category or note. */
export const MAX_TEXT_LENGTH = 500;

/** Fields a transaction body may contain; anything else is rejected. */
export const TRANSACTION_FIELDS = [
  "amount",
  "currency",
  "occurredAt",
  "merchant",
  "category",
  "note",
] as const;

/** Plans a waitlist sign-up can say they'd pay for. Mirrors `apps/mobile/lib/plans.ts`. */
export const WAITLIST_PLANS = ["subscription", "own-key", "undecided"] as const;

/** Answers to the one question asked after joining the waitlist. */
export const TRACKS_WITH = ["nothing", "spreadsheet", "another-app", "bank-app", "paper"] as const;

/** Places a person moves up for each friend who joins through their link. */
export const PLACES_PER_REFERRAL = 10;

/** Invite codes: lower-case letters and digits. */
export const INVITE_CODE_PATTERN = /^[a-z0-9]{6,16}$/;

/** Longest allowed email address (RFC 5321). */
export const MAX_EMAIL_LENGTH = 254;

/** Deliberately loose: one @, no spaces, a dot in the domain. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
