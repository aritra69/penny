import { CAPTURE_DUPLICATE_WINDOW_MS } from "../constants/index.ts";

export type Payment = {
  /** Signed, in minor units. */
  amount: number;
  currency: string;
  accountHint: string | null;
  referenceHash: string | null;
  /** ISO 8601. */
  occurredAt: string;
};

/** A payment already saved, with the senders whose alerts were merged into it. */
export type SavedPayment = Payment & { id: string; senders: string[] };

/**
 * The saved payment a new alert is about, if any. One payment usually sends several alerts: the
 * bank's SMS, the bank app's notification and the UPI app's notification.
 *
 * - Same reference number (UTR, UPI ref): the same payment.
 * - Otherwise the same amount, currency and account within a few minutes, from a different sender
 *   (a sender alerts once per payment, so two from one sender are two payments), and without
 *   two different reference numbers.
 */
export function findDuplicate(
  payment: Payment,
  sender: string,
  saved: readonly SavedPayment[],
  windowMs = CAPTURE_DUPLICATE_WINDOW_MS,
): SavedPayment | null {
  if (payment.referenceHash) {
    const sameReference = saved.find((other) => other.referenceHash === payment.referenceHash);
    if (sameReference) return sameReference;
  }

  const at = Date.parse(payment.occurredAt);
  return (
    saved.find(
      (other) =>
        other.amount === payment.amount &&
        other.currency === payment.currency &&
        Math.abs(Date.parse(other.occurredAt) - at) <= windowMs &&
        !other.senders.includes(sender) &&
        (!other.accountHint || !payment.accountHint || other.accountHint === payment.accountHint) &&
        (!other.referenceHash || !payment.referenceHash),
    ) ?? null
  );
}
