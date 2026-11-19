import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createAuth } from "./auth.ts";
import { openDb } from "./db.ts";
import { startServer } from "./server.ts";

const AUTH_URL = "http://localhost";

let server: ReturnType<typeof startServer>;
let base: string;
/** Session cookies of two signed-up users. */
let alice: string;
let bob: string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- response shapes are asserted below
const read = (res: Response) => res.json() as Promise<any>;

const send = (path: string, init?: RequestInit) =>
  fetch(base + path, {
    ...init,
    headers: { "content-type": "application/json", origin: AUTH_URL, ...init?.headers },
  });

/** Signs up through Better Auth and returns the session cookie it sets. */
async function signUp(email: string) {
  const res = await send("/api/auth/sign-up/email", {
    method: "POST",
    body: JSON.stringify({ email, password: "correct horse battery", name: email.split("@")[0] }),
  });
  expect(res.status).toBe(200);
  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
}

beforeAll(async () => {
  const db = openDb(":memory:");
  const auth = createAuth(db, { baseURL: AUTH_URL, secret: "test-secret-".repeat(4) });
  server = startServer({ db, auth, port: 0 });
  base = server.url.href.replace(/\/$/, "");
  alice = await signUp("alice@example.com");
  bob = await signUp("bob@example.com");
});
afterAll(() => server.stop(true));

/** Calls the API as `cookie`'s user (Alice by default). */
const call = (path: string, init?: RequestInit, cookie = alice) =>
  send(path, { ...init, headers: { cookie, ...init?.headers } });

const sample = {
  amount: -24900,
  currency: "INR",
  merchant: "Blue Tokai",
  category: "Coffee",
  occurredAt: "2026-11-18T09:30:00+05:30",
};

describe("transactions CRUD", () => {
  let id: string;

  test("creates a transaction", async () => {
    const res = await call("/transactions", {
      method: "POST",
      body: JSON.stringify(sample),
    });
    expect(res.status).toBe(201);
    const tx = await read(res);
    expect(tx).toMatchObject({
      amount: -24900,
      currency: "INR",
      merchant: "Blue Tokai",
      note: null,
      occurredAt: "2026-11-18T04:00:00.000Z",
    });
    id = tx.id;
  });

  test("reads it back", async () => {
    const res = await call(`/transactions/${id}`);
    expect(res.status).toBe(200);
    expect((await read(res)).id).toBe(id);
  });

  test("lists newest first", async () => {
    await call("/transactions", {
      method: "POST",
      body: JSON.stringify({ ...sample, occurredAt: "2026-11-19T10:00:00Z" }),
    });
    const res = await call("/transactions?limit=10");
    const { data } = await read(res);
    expect(data).toHaveLength(2);
    expect(data[0].occurredAt).toBe("2026-11-19T10:00:00.000Z");
  });

  test("patches only the given fields and allows clearing to null", async () => {
    const res = await call(`/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ category: "Food", merchant: null }),
    });
    expect(res.status).toBe(200);
    const tx = await read(res);
    expect(tx).toMatchObject({
      category: "Food",
      merchant: null,
      amount: -24900,
    });
    expect(tx.updatedAt >= tx.createdAt).toBe(true);
  });

  test("deletes it", async () => {
    expect((await call(`/transactions/${id}`, { method: "DELETE" })).status).toBe(204);
    expect((await call(`/transactions/${id}`)).status).toBe(404);
    expect((await call(`/transactions/${id}`, { method: "DELETE" })).status).toBe(404);
  });
});

describe("auth", () => {
  test("transactions need a session", async () => {
    expect((await send("/transactions")).status).toBe(401);
    expect((await send("/transactions", { method: "POST", body: "{}" })).status).toBe(401);
    expect((await call("/transactions", {}, "better-auth.session_token=forged")).status).toBe(401);
  });

  test("returns the signed-in user's session", async () => {
    const res = await call("/api/auth/get-session");
    expect(res.status).toBe(200);
    expect((await read(res)).user.email).toBe("alice@example.com");
  });

  test("signs in with the password it signed up with", async () => {
    const ok = await send("/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email: "alice@example.com", password: "correct horse battery" }),
    });
    expect(ok.status).toBe(200);
    const wrong = await send("/api/auth/sign-in/email", {
      method: "POST",
      body: JSON.stringify({ email: "alice@example.com", password: "wrong password" }),
    });
    expect(wrong.status).toBe(401);
  });

  test("users only see their own transactions", async () => {
    const tx = await read(
      await call("/transactions", { method: "POST", body: JSON.stringify(sample) }),
    );
    const asBob = (path: string, init?: RequestInit) => call(path, init, bob);

    expect((await read(await asBob("/transactions"))).data).toEqual([]);
    expect((await asBob(`/transactions/${tx.id}`)).status).toBe(404);
    expect(
      (await asBob(`/transactions/${tx.id}`, { method: "PATCH", body: '{"note":"mine"}' })).status,
    ).toBe(404);
    expect((await asBob(`/transactions/${tx.id}`, { method: "DELETE" })).status).toBe(404);
    expect((await call(`/transactions/${tx.id}`)).status).toBe(200);
  });

  test("sign-out ends the session", async () => {
    const cookie = await signUp("carol@example.com");
    expect((await call("/transactions", {}, cookie)).status).toBe(200);
    expect((await call("/api/auth/sign-out", { method: "POST", body: "{}" }, cookie)).status).toBe(
      200,
    );
    expect((await call("/transactions", {}, cookie)).status).toBe(401);
  });
});

describe("validation", () => {
  test("rejects missing and malformed fields", async () => {
    const res = await call("/transactions", {
      method: "POST",
      body: JSON.stringify({ amount: 1.5, currency: "rupees", extra: true }),
    });
    expect(res.status).toBe(422);
    const { details } = await read(res);
    expect(details).toEqual(
      expect.arrayContaining([
        "unknown field: extra",
        "amount must be an integer in minor units (e.g. paise)",
        "currency must be a 3-letter ISO 4217 code, e.g. INR",
        "occurredAt is required",
      ]),
    );
  });

  test("rejects invalid JSON", async () => {
    const res = await call("/transactions", { method: "POST", body: "{nope" });
    expect(res.status).toBe(400);
  });

  test("rejects an empty patch", async () => {
    const created = await read(
      await call("/transactions", {
        method: "POST",
        body: JSON.stringify(sample),
      }),
    );
    const res = await call(`/transactions/${created.id}`, {
      method: "PATCH",
      body: "{}",
    });
    expect(res.status).toBe(422);
  });

  test("rejects bad pagination", async () => {
    expect((await call("/transactions?limit=0")).status).toBe(400);
    expect((await call("/transactions?offset=-1")).status).toBe(400);
  });

  test("unknown routes are 404", async () => {
    expect((await call("/nope")).status).toBe(404);
  });
});
