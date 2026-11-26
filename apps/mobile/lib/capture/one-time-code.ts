/**
 * Spots one-time codes (OTP, verification and login codes) so the phone can drop them before
 * anything is stored, logged or sent. A copy of the API's `capture/one-time-code.ts`, which
 * checks again for any that slip through.
 *
 * The native capture code runs the same patterns in Kotlin (`OneTimeCode.kt`), because it drops
 * codes before a message is queued. `one-time-code.test.ts` checks the two copies match.
 */

/** Words that mark a one-time code message. */
export const CODE_WORDS =
  /\b(otp|one[\s-]?time[\s-]?(password|passcode|pin|code)|verification code|security code|auth(entication)? code|login code)\b/i;

/** A standalone 4–8 digit number (not part of an amount like 1,249.00): the code itself. */
export const CODE_NUMBER = /(?<!\d|\d[.,])\d{4,8}(?!\d|[.,]\d)/;

/**
 * Words that only appear once money has moved. Debit alerts often end with "Never share your OTP",
 * which must not make them look like a code.
 */
export const MONEY_MOVED =
  /\b(debited|credited|spent|withdrawn|received|refunded|has been paid|was paid)\b/i;

/** Whether a message is a one-time code. Pass the title and text together. */
export function isOneTimeCode(text: string): boolean {
  return CODE_WORDS.test(text) && CODE_NUMBER.test(text) && !MONEY_MOVED.test(text);
}
