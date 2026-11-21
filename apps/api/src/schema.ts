import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
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
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString())
      .$onUpdateFn(() => new Date().toISOString()),
  },
  (t) => [index("transactions_user_occurred_at").on(t.userId, t.occurredAt)],
);

/** A row as stored, with the money fields still encrypted. */
export type TransactionRow = typeof transactions.$inferSelect;
/** A transaction as the API returns it. */
export type Transaction = Omit<TransactionRow, "amount"> & { amount: number };
export type TransactionInput = Pick<Transaction, "amount" | "currency" | "occurredAt"> &
  Partial<Pick<Transaction, "merchant" | "category" | "note">>;
export type TransactionPatch = Partial<TransactionInput>;

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
