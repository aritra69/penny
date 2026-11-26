package com.penny.mobile.capture

/**
 * Spots one-time codes (OTP, verification and login codes). They are dropped before a message is
 * queued, so they are never stored, logged or sent.
 *
 * The same patterns as `lib/capture/one-time-code.ts` and the API's copy; the Vitest test there
 * checks the raw strings below match. Change all three together.
 */
object OneTimeCode {
  /** Words that mark a one-time code message. */
  private val CODE_WORDS =
    Regex(
      """\b(otp|one[\s-]?time[\s-]?(password|passcode|pin|code)|verification code|security code|auth(entication)? code|login code)\b""",
      RegexOption.IGNORE_CASE,
    )

  /** A standalone 4–8 digit number (not part of an amount like 1,249.00): the code itself. */
  private val CODE_NUMBER = Regex("""(?<!\d|\d[.,])\d{4,8}(?!\d|[.,]\d)""")

  /** Words that only appear once money has moved ("…debited. Never share your OTP"). */
  private val MONEY_MOVED =
    Regex(
      """\b(debited|credited|spent|withdrawn|received|refunded|has been paid|was paid)\b""",
      RegexOption.IGNORE_CASE,
    )

  fun matches(text: String): Boolean =
    CODE_WORDS.containsMatchIn(text) &&
      CODE_NUMBER.containsMatchIn(text) &&
      !MONEY_MOVED.containsMatchIn(text)
}
