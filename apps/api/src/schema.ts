import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth-schema.ts";

export * from "./auth-schema.ts";

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    /** Owner. Every query is scoped to the signed-in user. */
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Minor units (paise, cents). Negative = money out. */
    amount: integer("amount").notNull(),
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

export type Transaction = typeof transactions.$inferSelect;
export type TransactionInput = Omit<
  typeof transactions.$inferInsert,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type TransactionPatch = Partial<TransactionInput>;
