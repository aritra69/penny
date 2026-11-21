import type { Auth } from "./auth.ts";
import {
  DEFAULT_PAGE_LIMIT,
  DEFAULT_PAGE_OFFSET,
  MAX_PAGE_LIMIT,
  MIN_PAGE_LIMIT,
} from "./constants/index.ts";
import type { Db } from "./db.ts";
import { createTransactionStore } from "./transactions.ts";
import { validateTransaction } from "./validate.ts";
import { createWaitlistStore, validateAnswer, validateWaitlist } from "./waitlist.ts";

const json = (data: unknown, status = 200) => Response.json(data, { status });
const error = (status: number, message: string, details?: string[]) =>
  json({ error: message, ...(details && { details }) }, status);

async function readJson(req: Request): Promise<{ ok: true; body: unknown } | { ok: false }> {
  try {
    return { ok: true, body: await req.json() };
  } catch {
    return { ok: false };
  }
}

function intParam(url: URL, name: string, fallback: number, min: number, max: number) {
  const raw = url.searchParams.get(name);
  if (raw === null) return fallback;
  const n = Number(raw);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

export type ServerOptions = { db: Db; auth: Auth; port: number };

export function startServer({ db, auth, port }: ServerOptions) {
  const transactions = createTransactionStore(db);
  const waitlist = createWaitlistStore(db);

  /** Runs `handler` with the signed-in user's ID, or answers 401. */
  const signedIn =
    <R extends Request>(handler: (req: R, userId: string) => Response | Promise<Response>) =>
    async (req: R) => {
      const session = await auth.api.getSession({ headers: req.headers });
      return session ? handler(req, session.user.id) : error(401, "sign in required");
    };

  return Bun.serve({
    port,
    routes: {
      "/health": () => json({ ok: true }),

      // Sign-up, sign-in (email + Google), sessions, sign-out… see https://better-auth.com/docs
      "/api/auth/*": (req) => auth.handler(req),

      // Public: the landing page's waitlist form. Answers with the person's place in line and
      // their invite code; joining again with the same email updates the plan.
      "/waitlist": {
        POST: async (req) => {
          const parsed = await readJson(req);
          if (!parsed.ok) return error(400, "invalid JSON");
          const result = validateWaitlist(parsed.body);
          if (!result.ok) return error(422, "validation failed", result.errors);
          return json(waitlist.join(result.value), 201);
        },
      },

      // Public: the one question asked after joining. The invite code identifies the row.
      "/waitlist/answer": {
        POST: async (req) => {
          const parsed = await readJson(req);
          if (!parsed.ok) return error(400, "invalid JSON");
          const result = validateAnswer(parsed.body);
          if (!result.ok) return error(422, "validation failed", result.errors);
          return waitlist.answer(result.value.code, result.value.answer)
            ? new Response(null, { status: 204 })
            : error(404, "not on the waitlist");
        },
      },

      "/transactions": {
        GET: signedIn((req, userId) => {
          const url = new URL(req.url);
          const limit = intParam(url, "limit", DEFAULT_PAGE_LIMIT, MIN_PAGE_LIMIT, MAX_PAGE_LIMIT);
          const offset = intParam(url, "offset", DEFAULT_PAGE_OFFSET, 0, Number.MAX_SAFE_INTEGER);
          if (limit === null || offset === null) {
            return error(
              400,
              `limit must be ${MIN_PAGE_LIMIT}–${MAX_PAGE_LIMIT} and offset must be ≥ 0`,
            );
          }
          return json({
            data: transactions.list(userId, limit, offset),
            limit,
            offset,
          });
        }),

        POST: signedIn(async (req, userId) => {
          const parsed = await readJson(req);
          if (!parsed.ok) return error(400, "invalid JSON");
          const result = validateTransaction(parsed.body, false);
          if (!result.ok) return error(422, "validation failed", result.errors);
          return json(transactions.create(userId, result.value), 201);
        }),
      },

      "/transactions/:id": {
        GET: signedIn((req, userId) => {
          const tx = transactions.get(userId, req.params.id);
          return tx ? json(tx) : error(404, "transaction not found");
        }),

        PATCH: signedIn(async (req, userId) => {
          const parsed = await readJson(req);
          if (!parsed.ok) return error(400, "invalid JSON");
          const result = validateTransaction(parsed.body, true);
          if (!result.ok) return error(422, "validation failed", result.errors);
          const tx = transactions.update(userId, req.params.id, result.value);
          return tx ? json(tx) : error(404, "transaction not found");
        }),

        DELETE: signedIn((req, userId) =>
          transactions.delete(userId, req.params.id)
            ? new Response(null, { status: 204 })
            : error(404, "transaction not found"),
        ),
      },
    },

    fetch: () => error(404, "not found"),

    error: (err) => {
      console.error(err);
      return error(500, "internal server error");
    },
  });
}
