/** Words that mark a one-time code message. */
const CODE_WORDS =
  /\b(otp|one[\s-]?time[\s-]?(password|passcode|pin|code)|verification code|security code|auth(entication)? code|login code)\b/i;

/** A standalone 4–8 digit number (not part of an amount like 1,249.00): the code itself. */
const CODE_NUMBER = /(?<!\d|\d[.,])\d{4,8}(?!\d|[.,]\d)/;

/**
 * Words that only appear once money has moved. Debit alerts often end with "Never share your OTP",
 * which must not make them look like a code.
 */
const MONEY_MOVED =
  /\b(debited|credited|spent|withdrawn|received|refunded|has been paid|was paid)\b/i;

/**
 * Whether a message is a one-time code (OTP, verification or login code). These are dropped
 * without being stored, sent to the model or logged; the phone drops them first, and this is
 * the API's own check for any that slip through.
 */
export function isOneTimeCode(text: string): boolean {
  return CODE_WORDS.test(text) && CODE_NUMBER.test(text) && !MONEY_MOVED.test(text);
}
