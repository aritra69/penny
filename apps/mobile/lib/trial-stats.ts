/**
 * What Penny did during the free month, from the user's transactions: shown on the trial-ending
 * and Your plan screens. Plain logic, no React Native.
 */

/** The fields of a transaction (as `GET /transactions` returns it) that the summary needs. */
export type TransactionSummaryInput = {
  amount: number;
  currency: string;
  occurredAt: string;
  /** "manual" for entries the user typed; anything else came from a message Penny read. */
  source: string;
};

export type TrialStats = {
  /** Transactions Penny read from bank and payment-app messages since the month started. */
  sorted: number;
  /** Money out since the month started, in minor units of `currency` (positive). */
  spent: { amount: number; currency: string };
};

/**
 * Counts what happened since `since`. Spending is summed in `currency` only: amounts in another
 * currency can't be added to it without a rate.
 */
export function summariseTrial(
  transactions: readonly TransactionSummaryInput[],
  since: string,
  currency = "INR",
): TrialStats {
  const start = Date.parse(since);
  let sorted = 0;
  let spent = 0;
  for (const tx of transactions) {
    if (Date.parse(tx.occurredAt) < start) continue;
    if (tx.source !== "manual") sorted += 1;
    if (tx.amount < 0 && tx.currency === currency) spent -= tx.amount;
  }
  return { sorted, spent: { amount: spent, currency } };
}

/** True once a page (newest first) reaches back past `since`, so no older page is needed. */
export function reachedStart(page: readonly TransactionSummaryInput[], since: string): boolean {
  const last = page[page.length - 1];
  return !!last && Date.parse(last.occurredAt) < Date.parse(since);
}
