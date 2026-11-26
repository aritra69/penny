import { index, pgTable, real, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth-schema.ts";

export * from "./auth-schema.ts";

export const transactions = pgTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /** Owner. Every query is scoped to the signed-in user. */
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /**
     * Encrypted by `vault.ts` before it is stored: the integer amount in minor units (paise,
     * cents; negative = money out), as text. So are merchant, category and note.
     */
    amount: text("amount").notNull(),
    /** ISO 4217 code, e.g. INR. */
    currency: text("currency").notNull(),
    merchant: text("merchant"),
    category: text("category"),
    note: text("note"),
    /** ISO 8601, stored normalised to UTC so string order = time order. */
    occurredAt: text("occurred_at").notNull(),
    /**
     * `confirmed`: counted everywhere. `needs_review`: Penny read it from a message but wasn't
     * sure, so it waits in the Review inbox. See TRANSACTION_STATUSES.
     */
    status: text("status").notNull().default("confirmed"),
    /** Where it came from: `manual`, `sms` or `notification`. See TRANSACTION_SOURCES. */
    source: text("source").notNull().default("manual"),
    /** Encrypted: the account or card's last digits as the message gave them ("XX1234" → "1234"). */
    accountHint: text("account_hint"),
    /**
     * Keyed hash of the bank or UPI reference number (UTR, RRN, txn ID), so alerts about the same
     * payment from different apps can be matched without storing the reference itself.
     */
    referenceHash: text("reference_hash"),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdateFn(() => new Date().toISOString()),
  },
  (t) => [
    index("transactions_user_occurred_at").on(t.userId, t.occurredAt),
    index("transactions_user_reference").on(t.userId, t.referenceHash),
  ],
);

/** A row as stored, with the money fields still encrypted. */
export type TransactionRow = typeof transactions.$inferSelect;
/** A transaction as the API returns it. */
export type Transaction = Omit<TransactionRow, "amount" | "referenceHash"> & { amount: number };
export type TransactionInput = Pick<Transaction, "amount" | "currency" | "occurredAt"> &
  Partial<Pick<Transaction, "merchant" | "category" | "note">>;
export type TransactionPatch = Partial<TransactionInput>;

/**
 * Every bank SMS or payment-app notification the phone passed on, and what Penny did with it.
 * One-time codes never get here: the phone drops them, and the API drops any that slip through
 * without storing them. Feeds "Sorted by Penny" on Review (merged alerts, ignored offers).
 */
export const captures = pgTable(
  "captures",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** The transaction it created or was merged into. Null when it was ignored. */
    transactionId: text("transaction_id").references(() => transactions.id, {
      onDelete: "set null",
    }),
    /** `sms` or `notification`. */
    source: text("source").notNull(),
    /** SMS sender ID ("AX-HDFCBK") or the app's package name ("com.phonepe.app"). */
    sender: text("sender").notNull(),
    /** Encrypted: the message as received (title and body). */
    message: text("message").notNull(),
    /**
     * Keyed hash of sender and message, so the same alert posted twice (Android re-posts
     * notifications when they update) is recognised without reading every stored message.
     */
    fingerprint: text("fingerprint").notNull(),
    /** What the message was: spent, received, offer, balance, request or other. */
    kind: text("kind").notNull(),
    /** `saved`, `review`, `duplicate` or `ignored`. See CAPTURE_OUTCOMES. */
    outcome: text("outcome").notNull(),
    /** Encrypted: Penny's one-line reasoning, shown when reviewing. */
    reason: text("reason"),
    /** How sure the model was, 0 to 1. */
    confidence: real("confidence"),
    /** When the phone received it, ISO 8601 in UTC. */
    receivedAt: text("received_at").notNull(),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (t) => [
    index("captures_user_received_at").on(t.userId, t.receivedAt),
    index("captures_user_fingerprint").on(t.userId, t.fingerprint),
  ],
);

export type CaptureRow = typeof captures.$inferSelect;

/** People who asked to hear when Penny launches, and the plan they'd pay for. */
export const waitlist = pgTable("waitlist", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  /** Lower-cased, so the same person signs up once. */
  email: text("email").notNull().unique(),
  /** subscription | own-key | undecided */
  plan: text("plan").notNull(),
  /** Short code for this person's invite link. */
  code: text("code").notNull().unique(),
  /** The invite code this person signed up through, if any. */
  referredBy: text("referred_by"),
  /** Answer to "What do you use to track money today?" */
  tracksWith: text("tracks_with"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString())
    .$onUpdateFn(() => new Date().toISOString()),
});

export type WaitlistEntry = typeof waitlist.$inferSelect;
