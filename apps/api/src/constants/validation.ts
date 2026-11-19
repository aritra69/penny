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
