import { and, eq, gte } from "drizzle-orm";
import {
  CAPTURE_CONFIDENCE_TO_SAVE,
  CAPTURE_DUPLICATE_WINDOW_MS,
  CURRENCY_PATTERN,
  MAX_TEXT_LENGTH,
  type CAPTURE_KINDS,
  type CAPTURE_OUTCOMES,
  type CAPTURE_SOURCES,
} from "../constants/index.ts";
import type { Db } from "../db.ts";
import { captures, type Transaction } from "../schema.ts";
import type { TransactionStore } from "../transactions.ts";
import type { Vault } from "../vault.ts";
import { findDuplicate } from "./duplicates.ts";
import type { Extractor } from "./extract.ts";
import { toMinorUnits } from "./money.ts";
import { resolveOccurredAt } from "./occurred-at.ts";
import { isOneTimeCode } from "./one-time-code.ts";

export type CaptureInput = {
  source: (typeof CAPTURE_SOURCES)[number];
  sender: string;
  title: string | null;
  text: string;
  /** ISO 8601 in UTC. */
  receivedAt: string;
};

export type CaptureResult =
  | { outcome: "dropped" }
  | {
      outcome: (typeof CAPTURE_OUTCOMES)[number];
      kind: (typeof CAPTURE_KINDS)[number];
      transaction: Transaction | null;
    };

const clip = (value: string | null) => (value ? value.trim().slice(0, MAX_TEXT_LENGTH) : null);
const digitsAndLetters = (value: string | null) => value?.replace(/[^0-9a-z]/gi, "") || null;

/**
 * Turns one bank SMS or payment-app notification into a transaction:
 * one-time codes are dropped unread; the model reads the rest; offers, balance alerts and
 * payment requests are noted but not counted; a second alert for a saved payment is merged
 * into it; a payment Penny is sure about is saved, and anything else waits in the Review inbox.
 * Every message except a dropped code is kept (encrypted) so Review can show what was read.
 */
export function createCaptureService(
  db: Db,
  vault: Vault,
  transactions: TransactionStore,
  extract: Extractor,
) {
  return {
    async process(userId: string, input: CaptureInput): Promise<CaptureResult> {
      const message = [input.title, input.text].filter(Boolean).join("\n");
      if (isOneTimeCode(message)) return { outcome: "dropped" };

      const fingerprint = vault.fingerprint(userId, `${input.sender}\n${message}`);
      const record = (
        fields: Pick<typeof captures.$inferInsert, "kind" | "outcome" | "transactionId"> & {
          reason: string;
          confidence: number | null;
        },
      ) =>
        db.insert(captures).values({
          ...fields,
          userId,
          source: input.source,
          sender: input.sender,
          message: vault.seal(userId, message),
          fingerprint,
          reason: vault.seal(userId, fields.reason),
          receivedAt: input.receivedAt,
        });

      // The same notification posted again (Android re-posts one when it updates).
      const since = new Date(Date.parse(input.receivedAt) - CAPTURE_DUPLICATE_WINDOW_MS);
      const [repeat] = await db
        .select({ kind: captures.kind, transactionId: captures.transactionId })
        .from(captures)
        .where(
          and(
            eq(captures.userId, userId),
            eq(captures.fingerprint, fingerprint),
            gte(captures.receivedAt, since.toISOString()),
          ),
        )
        .limit(1);
      if (repeat) {
        const transaction = repeat.transactionId
          ? await transactions.get(userId, repeat.transactionId)
          : null;
        return {
          outcome: "duplicate",
          kind: repeat.kind as (typeof CAPTURE_KINDS)[number],
          transaction,
        };
      }

      const read = await extract({ sender: input.sender, title: input.title, text: input.text });
      const currency = CURRENCY_PATTERN.test(read.currency) ? read.currency : "INR";
      const minor = read.amount === null ? null : toMinorUnits(read.amount, currency);

      if ((read.kind !== "spent" && read.kind !== "received") || minor === null) {
        await record({
          kind: read.kind,
          outcome: "ignored",
          transactionId: null,
          reason: read.reason,
          confidence: read.confidence,
        });
        return { outcome: "ignored", kind: read.kind, transaction: null };
      }

      const occurredAt = resolveOccurredAt(read.date, read.time, input.receivedAt);
      const reference = digitsAndLetters(read.reference);
      const payment = {
        amount: read.kind === "spent" ? -minor : minor,
        currency,
        accountHint: digitsAndLetters(read.accountLast4)?.slice(-4) ?? null,
        referenceHash: reference ? vault.fingerprint(userId, reference) : null,
        occurredAt,
      };

      const at = Date.parse(occurredAt);
      const candidates = await transactions.matchCandidates(userId, {
        referenceHash: payment.referenceHash,
        from: new Date(at - CAPTURE_DUPLICATE_WINDOW_MS).toISOString(),
        to: new Date(at + CAPTURE_DUPLICATE_WINDOW_MS).toISOString(),
      });
      const duplicate = findDuplicate(payment, input.sender, candidates);
      if (duplicate) {
        await record({
          kind: read.kind,
          outcome: "duplicate",
          transactionId: duplicate.id,
          reason: read.reason,
          confidence: read.confidence,
        });
        return {
          outcome: "duplicate",
          kind: read.kind,
          transaction: await transactions.get(userId, duplicate.id),
        };
      }

      const sure = read.confidence >= CAPTURE_CONFIDENCE_TO_SAVE;
      const transaction = await transactions.createCaptured(userId, {
        ...payment,
        merchant: clip(read.counterparty),
        status: sure ? "confirmed" : "needs_review",
        source: input.source,
      });
      await record({
        kind: read.kind,
        outcome: sure ? "saved" : "review",
        transactionId: transaction.id,
        reason: read.reason,
        confidence: read.confidence,
      });
      return { outcome: sure ? "saved" : "review", kind: read.kind, transaction };
    },
  };
}

export type CaptureService = ReturnType<typeof createCaptureService>;
