import { count, eq, lte } from "drizzle-orm";
import {
  EMAIL_PATTERN,
  INVITE_CODE_PATTERN,
  MAX_EMAIL_LENGTH,
  PLACES_PER_REFERRAL,
  TRACKS_WITH,
  WAITLIST_PLANS,
} from "./constants/index.ts";
import type { Db } from "./db.ts";
import { waitlist } from "./schema.ts";

export type WaitlistPlan = (typeof WAITLIST_PLANS)[number];
export type TracksWith = (typeof TRACKS_WITH)[number];
export type WaitlistInput = { email: string; plan: WaitlistPlan; ref?: string };
export type WaitlistPlace = { position: number; code: string };

type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export function validateWaitlist(body: unknown): Result<WaitlistInput> {
  if (!isRecord(body)) return { ok: false, errors: ["body must be a JSON object"] };
  const { email, plan, ref, ...rest } = body;
  const errors = Object.keys(rest).map((key) => `unknown field: ${key}`);

  const normalised = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (normalised.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(normalised)) {
    errors.push("email must be a valid email address");
  }
  if (!WAITLIST_PLANS.includes(plan as WaitlistPlan)) {
    errors.push(`plan must be one of: ${WAITLIST_PLANS.join(", ")}`);
  }
  // A bad invite code is ignored rather than rejected: the person still joins.
  const refCode = typeof ref === "string" && INVITE_CODE_PATTERN.test(ref) ? ref : undefined;

  return errors.length
    ? { ok: false, errors }
    : { ok: true, value: { email: normalised, plan: plan as WaitlistPlan, ref: refCode } };
}

export function validateAnswer(body: unknown): Result<{ code: string; answer: TracksWith }> {
  if (!isRecord(body)) return { ok: false, errors: ["body must be a JSON object"] };
  const { code, answer, ...rest } = body;
  const errors = Object.keys(rest).map((key) => `unknown field: ${key}`);
  if (typeof code !== "string" || !INVITE_CODE_PATTERN.test(code)) {
    errors.push("code must be an invite code");
  }
  if (!TRACKS_WITH.includes(answer as TracksWith)) {
    errors.push(`answer must be one of: ${TRACKS_WITH.join(", ")}`);
  }
  return errors.length
    ? { ok: false, errors }
    : { ok: true, value: { code: code as string, answer: answer as TracksWith } };
}

/** Seven random lower-case letters and digits. */
function newCode() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(7));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function createWaitlistStore(db: Db) {
  /** Place in line: order of joining, moved up for each friend who joined through your link. */
  const place = async (code: string, createdAt: string): Promise<number> => {
    const [ahead] = await db
      .select({ n: count() })
      .from(waitlist)
      .where(lte(waitlist.createdAt, createdAt));
    const [invited] = await db
      .select({ n: count() })
      .from(waitlist)
      .where(eq(waitlist.referredBy, code));
    return Math.max(1, (ahead?.n ?? 1) - PLACES_PER_REFERRAL * (invited?.n ?? 0));
  };

  return {
    /** Adds the email, or updates the plan if it's already on the list. */
    async join({ email, plan, ref }: WaitlistInput): Promise<WaitlistPlace> {
      const [row] = await db
        .insert(waitlist)
        .values({ email, plan, code: newCode(), referredBy: ref ?? null })
        .onConflictDoUpdate({ target: waitlist.email, set: { plan } })
        .returning();
      return { position: await place(row!.code, row!.createdAt), code: row!.code };
    },

    /** Saves the answer to the one question. False if the code isn't on the list. */
    async answer(code: string, answer: TracksWith): Promise<boolean> {
      const rows = await db
        .update(waitlist)
        .set({ tracksWith: answer })
        .where(eq(waitlist.code, code))
        .returning({ id: waitlist.id });
      return rows.length > 0;
    },
  };
}
