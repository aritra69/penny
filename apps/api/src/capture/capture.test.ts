import { beforeAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import type { Db } from "../db.ts";
import { captures, transactions as transactionsTable, users } from "../schema.ts";
import { openTestDb } from "../test-db.ts";
import { createTransactionStore } from "../transactions.ts";
import { createVault } from "../vault.ts";
import { createCaptureService, type CaptureInput, type CaptureService } from "./capture.ts";
import type { Extraction, Extractor, MessageToRead } from "./extract.ts";

const vault = createVault(Buffer.alloc(32, 3).toString("base64"));

const BANK_SMS =
  "Rs.249.00 debited from A/c XX1234 on 18-11-26 to VPA bluetokai@okaxis. UPI Ref 432198765012. -SBI";
const GPAY = "₹249 paid to Blue Tokai Coffee";
const OFFER = "Get 10% cashback on your next 3 UPI payments! T&C apply";
const UNSURE = "Txn of 1,200 on card XX4455 at MERCHANT*8812";
const OTP = "123456 is your OTP for txn of INR 1,249.00 at AMAZON. Do not share.";

/** What the fake model "reads" from each message. */
const READS: Record<string, Extraction> = {
  [BANK_SMS]: {
    kind: "spent",
    amount: "249.00",
    currency: "INR",
    counterparty: "Blue Tokai",
    accountLast4: "XX1234",
    reference: "432198765012",
    occurredAt: "2026-11-18T09:30:00+05:30",
    confidence: 0.97,
    reason: "A UPI payment from your SBI account.",
  },
  [GPAY]: {
    kind: "spent",
    amount: "249",
    currency: "INR",
    counterparty: "Blue Tokai Coffee",
    accountLast4: null,
    reference: null,
    occurredAt: null,
    confidence: 0.9,
    reason: "Google Pay says you paid Blue Tokai.",
  },
  [OFFER]: {
    kind: "offer",
    amount: null,
    currency: "INR",
    counterparty: null,
    accountLast4: null,
    reference: null,
    occurredAt: null,
    confidence: 0.99,
    reason: "A cashback offer, no money moved.",
  },
  [UNSURE]: {
    kind: "spent",
    amount: "1,200",
    currency: "INR",
    counterparty: null,
    accountLast4: "4455",
    reference: null,
    occurredAt: null,
    confidence: 0.55,
    reason: "Looks like a card payment, but the merchant isn't named.",
  },
};

const seen: MessageToRead[] = [];
const fakeExtract: Extractor = async (message) => {
  seen.push(message);
  const read = READS[message.text];
  if (!read) throw new Error(`no scripted read for: ${message.text}`);
  return read;
};

let db: Db;
let service: CaptureService;
let userId: string;

const message = (text: string, overrides: Partial<CaptureInput> = {}): CaptureInput => ({
  source: "sms",
  sender: "AX-SBIINB",
  title: null,
  text,
  receivedAt: "2026-11-18T04:00:20.000Z",
  ...overrides,
});

beforeAll(async () => {
  db = await openTestDb();
  const [user] = await db
    .insert(users)
    .values({ name: "Asha", email: "asha@example.com" })
    .returning({ id: users.id });
  userId = user!.id;
  service = createCaptureService(db, vault, createTransactionStore(db, vault), fakeExtract);
}, 30_000);

describe("capture", () => {
  test("drops a one-time code without reading or storing it", async () => {
    const before = seen.length;
    expect(await service.process(userId, message(OTP))).toEqual({ outcome: "dropped" });
    expect(seen.length).toBe(before);
    expect(await db.select().from(captures)).toHaveLength(0);
  });

  test("saves a payment it is sure about, encrypted, in minor units", async () => {
    const result = await service.process(userId, message(BANK_SMS));
    expect(result).toMatchObject({
      outcome: "saved",
      kind: "spent",
      transaction: {
        amount: -24900,
        currency: "INR",
        merchant: "Blue Tokai",
        accountHint: "1234",
        status: "confirmed",
        source: "sms",
        occurredAt: "2026-11-18T04:00:00.000Z",
      },
    });

    const [row] = await db.select().from(transactionsTable);
    expect(row!.amount).not.toContain("24900");
    expect(row!.merchant).not.toContain("Blue");
    expect(row!.referenceHash).not.toContain("432198765012");
    const [stored] = await db.select().from(captures);
    expect(stored!.message).not.toContain("debited");
  });

  test("merges the UPI app's alert for the same payment", async () => {
    const result = await service.process(
      userId,
      message(GPAY, {
        source: "notification",
        sender: "com.google.android.apps.nbu.paisa.user",
        receivedAt: "2026-11-18T04:01:05.000Z",
      }),
    );
    expect(result).toMatchObject({ outcome: "duplicate", transaction: { amount: -24900 } });
    expect(await db.select().from(transactionsTable)).toHaveLength(1);
  });

  test("recognises the same alert posted twice without asking the model again", async () => {
    const before = seen.length;
    const result = await service.process(userId, message(BANK_SMS));
    expect(result).toMatchObject({ outcome: "duplicate", transaction: { amount: -24900 } });
    expect(seen.length).toBe(before);
  });

  test("ignores offers but keeps a note of them", async () => {
    const result = await service.process(userId, message(OFFER, { sender: "VM-PAYTMB" }));
    expect(result).toEqual({ outcome: "ignored", kind: "offer", transaction: null });
    const ignored = await db.select().from(captures).where(eq(captures.outcome, "ignored"));
    expect(ignored).toHaveLength(1);
  });

  test("sends a payment it isn't sure about to Review", async () => {
    const result = await service.process(userId, message(UNSURE, { sender: "JD-HDFCBK" }));
    expect(result).toMatchObject({
      outcome: "review",
      transaction: { amount: -120000, status: "needs_review", accountHint: "4455" },
    });
  });
});
