import { and, desc, eq } from "drizzle-orm";
import type { Db } from "./db.ts";
import {
  transactions,
  type Transaction,
  type TransactionInput,
  type TransactionPatch,
  type TransactionRow,
} from "./schema.ts";
import type { Vault } from "./vault.ts";

/** Stored encrypted. Everything else in a row (owner, currency, dates) is needed to query it. */
const SEALED_TEXT = ["merchant", "category", "note"] as const;

/**
 * Every method takes the owner's ID; a row owned by someone else behaves as if it didn't exist.
 * Amount, merchant, category and note are encrypted on the way in and decrypted on the way out.
 */
export function createTransactionStore(db: Db, vault: Vault) {
  const owned = (userId: string, id: string) =>
    and(eq(transactions.userId, userId), eq(transactions.id, id));

  const seal = (userId: string, patch: TransactionPatch) => {
    const { amount, ...rest } = patch;
    const row: Partial<TransactionRow> = { ...rest };
    if (amount !== undefined) row.amount = vault.seal(userId, String(amount));
    for (const key of SEALED_TEXT) {
      const value = patch[key];
      if (typeof value === "string") row[key] = vault.seal(userId, value);
    }
    return row;
  };

  const open = (row: TransactionRow): Transaction => {
    const text = (value: string | null) => (value === null ? null : vault.open(row.userId, value));
    return {
      ...row,
      amount: Number(vault.open(row.userId, row.amount)),
      merchant: text(row.merchant),
      category: text(row.category),
      note: text(row.note),
    };
  };

  return {
    async list(userId: string, limit: number, offset: number): Promise<Transaction[]> {
      const rows = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))
        .limit(limit)
        .offset(offset);
      return rows.map(open);
    },

    async get(userId: string, id: string): Promise<Transaction | null> {
      const [row] = await db.select().from(transactions).where(owned(userId, id));
      return row ? open(row) : null;
    },

    async create(userId: string, input: TransactionInput): Promise<Transaction> {
      const { amount, ...rest } = seal(userId, input);
      const [row] = await db
        .insert(transactions)
        .values({
          ...rest,
          amount: amount!,
          currency: input.currency,
          occurredAt: input.occurredAt,
          userId,
        })
        .returning();
      return open(row!);
    },

    async update(userId: string, id: string, patch: TransactionPatch): Promise<Transaction | null> {
      const [row] = await db
        .update(transactions)
        .set(seal(userId, patch))
        .where(owned(userId, id))
        .returning();
      return row ? open(row) : null;
    },

    async delete(userId: string, id: string): Promise<boolean> {
      const rows = await db
        .delete(transactions)
        .where(owned(userId, id))
        .returning({ id: transactions.id });
      return rows.length > 0;
    },
  };
}

export type TransactionStore = ReturnType<typeof createTransactionStore>;
