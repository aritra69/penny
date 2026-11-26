import { describe, expect, it } from "vitest";

import { reachedStart, summariseTrial, type TransactionSummaryInput } from "@/lib/trial-stats";

const since = "2026-11-23T12:00:00.000Z";
const tx = (patch: Partial<TransactionSummaryInput>): TransactionSummaryInput => ({
  amount: -10000,
  currency: "INR",
  occurredAt: "2026-11-25T08:00:00.000Z",
  source: "sms",
  ...patch,
});

describe("summariseTrial", () => {
  it("counts messages Penny read and money out since the month started", () => {
    const stats = summariseTrial(
      [
        tx({ amount: -38600 }),
        tx({ amount: 250000, source: "notification" }), // salary: sorted, not spending
        tx({ amount: -5000, source: "manual" }), // typed in: spending, not sorted
        tx({ amount: -99900, occurredAt: "2026-11-20T08:00:00.000Z" }), // before the trial
        tx({ amount: -1200, currency: "USD" }), // another currency: sorted, not summed
      ],
      since,
    );
    expect(stats).toEqual({ sorted: 3, spent: { amount: 43600, currency: "INR" } });
  });

  it("is zero with nothing to count", () => {
    expect(summariseTrial([], since)).toEqual({ sorted: 0, spent: { amount: 0, currency: "INR" } });
  });
});

describe("reachedStart", () => {
  it("stops paging once a page goes back past the start", () => {
    expect(reachedStart([tx({}), tx({ occurredAt: "2026-11-22T08:00:00.000Z" })], since)).toBe(
      true,
    );
    expect(reachedStart([tx({}), tx({})], since)).toBe(false);
    expect(reachedStart([], since)).toBe(false);
  });
});
