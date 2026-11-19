import { CURRENCY_PATTERN, MAX_TEXT_LENGTH, TRANSACTION_FIELDS } from "./constants/index.ts";
import type { TransactionInput, TransactionPatch } from "./schema.ts";

type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Validates a create body (`partial: false`) or a PATCH body (`partial: true`). */
export function validateTransaction(body: unknown, partial: true): Result<TransactionPatch>;
export function validateTransaction(body: unknown, partial: false): Result<TransactionInput>;
export function validateTransaction(
  body: unknown,
  partial: boolean,
): Result<TransactionInput | TransactionPatch> {
  if (!isRecord(body)) return { ok: false, errors: ["body must be a JSON object"] };

  const errors: string[] = [];
  const out: Record<string, unknown> = {};
  const known = new Set<string>(TRANSACTION_FIELDS);

  for (const key of Object.keys(body)) {
    if (!known.has(key)) errors.push(`unknown field: ${key}`);
  }

  const required = (key: string) => {
    if (body[key] === undefined) {
      if (!partial) errors.push(`${key} is required`);
      return false;
    }
    return true;
  };

  if (required("amount")) {
    const v = body.amount;
    if (typeof v !== "number" || !Number.isSafeInteger(v)) {
      errors.push("amount must be an integer in minor units (e.g. paise)");
    } else out.amount = v;
  }

  if (required("currency")) {
    const v = body.currency;
    if (typeof v !== "string" || !CURRENCY_PATTERN.test(v)) {
      errors.push("currency must be a 3-letter ISO 4217 code, e.g. INR");
    } else out.currency = v;
  }

  if (required("occurredAt")) {
    const v = body.occurredAt;
    if (typeof v !== "string" || Number.isNaN(Date.parse(v))) {
      errors.push("occurredAt must be an ISO 8601 date-time string");
    } else out.occurredAt = new Date(v).toISOString();
  }

  for (const key of ["merchant", "category", "note"] as const) {
    const v = body[key];
    if (v === undefined) continue;
    if (v !== null && (typeof v !== "string" || v.length > MAX_TEXT_LENGTH)) {
      errors.push(`${key} must be a string of at most ${MAX_TEXT_LENGTH} characters, or null`);
    } else out[key] = v;
  }

  if (partial && errors.length === 0 && Object.keys(out).length === 0) {
    errors.push("nothing to update");
  }

  return errors.length ? { ok: false, errors } : { ok: true, value: out as TransactionInput };
}
