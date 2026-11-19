import { and, desc, eq } from "drizzle-orm";
import type { Db } from "./db.ts";
import {
  transactions,
  type Transaction,
  type TransactionInput,
  type TransactionPatch,
} from "./schema.ts";

/** Every method takes the owner's ID; a row owned by someone else behaves as if it didn't exist. */
export function createTransactionStore(db: Db) {
  const owned = (userId: string, id: string) =>
    and(eq(transactions.userId, userId), eq(transactions.id, id));

  return {
    list(userId: string, limit: number, offset: number): Transaction[] {
      return db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))
        .limit(limit)
        .offset(offset)
        .all();
    },

    get(userId: string, id: string): Transaction | null {
      return db.select().from(transactions).where(owned(userId, id)).get() ?? null;
    },

    create(userId: string, input: TransactionInput): Transaction {
      return db
        .insert(transactions)
        .values({ ...input, userId })
        .returning()
        .get();
    },

    update(userId: string, id: string, patch: TransactionPatch): Transaction | null {
      return db.update(transactions).set(patch).where(owned(userId, id)).returning().get() ?? null;
    },

    delete(userId: string, id: string): boolean {
      return (
        db
          .delete(transactions)
          .where(owned(userId, id))
          .returning({ id: transactions.id })
          .get() !== undefined
      );
    },
  };
}

export type TransactionStore = ReturnType<typeof createTransactionStore>;
