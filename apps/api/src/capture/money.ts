import { CURRENCY_DIGITS } from "../constants/index.ts";

/**
 * "1,249.50" → 124950 for a currency with 2 minor digits. Works on the digits as text so no
 * float ever touches the amount. Returns null for anything that isn't a plain positive amount
 * or has more decimals than the currency allows.
 */
export function toMinorUnits(amount: string, currency: string): number | null {
  const digits = CURRENCY_DIGITS[currency] ?? 2;
  const cleaned = amount.replace(/[,\s]/g, "");
  const match = /^(\d+)(?:\.(\d+))?$/.exec(cleaned);
  if (!match) return null;
  const [, whole, fraction = ""] = match;
  const trimmed = fraction.replace(/0+$/, "");
  if (trimmed.length > digits) return null;
  const minor = Number(whole + fraction.padEnd(digits, "0").slice(0, digits));
  return Number.isSafeInteger(minor) && minor > 0 ? minor : null;
}
