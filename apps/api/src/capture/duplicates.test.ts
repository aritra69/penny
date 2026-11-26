import { describe, expect, test } from "bun:test";
import { findDuplicate, type Payment, type SavedPayment } from "./duplicates.ts";

const bankSms: SavedPayment = {
  id: "tx-1",
  amount: -24900,
  currency: "INR",
  accountHint: "1234",
  referenceHash: "ref-a",
  occurredAt: "2026-11-18T04:00:00.000Z",
  senders: ["AX-SBIINB"],
};

const gpay = (overrides: Partial<Payment> = {}): Payment => ({
  amount: -24900,
  currency: "INR",
  accountHint: null,
  referenceHash: null,
  occurredAt: "2026-11-18T04:01:30.000Z",
  ...overrides,
});

describe("findDuplicate", () => {
  test("matches on the reference number, whatever else differs", () => {
    const later = gpay({ referenceHash: "ref-a", occurredAt: "2026-11-18T09:00:00.000Z" });
    expect(findDuplicate(later, "com.google.android.apps.nbu.paisa.user", [bankSms])).toBe(bankSms);
  });

  test("matches the same amount a minute later from another app", () => {
    expect(findDuplicate(gpay(), "com.google.android.apps.nbu.paisa.user", [bankSms])).toBe(
      bankSms,
    );
  });

  test("keeps two payments from the same sender apart", () => {
    expect(findDuplicate(gpay(), "AX-SBIINB", [bankSms])).toBeNull();
  });

  test("keeps different amounts, accounts, references and times apart", () => {
    const app = "com.phonepe.app";
    expect(findDuplicate(gpay({ amount: -25000 }), app, [bankSms])).toBeNull();
    expect(findDuplicate(gpay({ amount: 24900 }), app, [bankSms])).toBeNull();
    expect(findDuplicate(gpay({ accountHint: "9876" }), app, [bankSms])).toBeNull();
    expect(findDuplicate(gpay({ referenceHash: "ref-b" }), app, [bankSms])).toBeNull();
    expect(
      findDuplicate(gpay({ occurredAt: "2026-11-18T04:30:00.000Z" }), app, [bankSms]),
    ).toBeNull();
  });
});
