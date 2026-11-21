import { createAuth } from "./auth.ts";
import { DEFAULT_AUTH_URL, DEFAULT_DATABASE_PATH, DEFAULT_PORT } from "./constants/index.ts";
import { openDb } from "./db.ts";
import { startServer } from "./server.ts";

const env = Bun.env;

if (!env.BETTER_AUTH_SECRET) {
  throw new Error(
    "BETTER_AUTH_SECRET is not set. Copy .env.example to .env at the repo root and fill it in.",
  );
}

const google =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
    : undefined;

const db = openDb(env.DATABASE_PATH ?? DEFAULT_DATABASE_PATH);
const auth = createAuth(db, {
  baseURL: env.BETTER_AUTH_URL ?? DEFAULT_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  dev: env.NODE_ENV !== "production",
  google,
  infraApiKey: env.BETTER_AUTH_API_KEY,
});
const server = startServer({ db, auth, port: Number(env.PORT ?? DEFAULT_PORT) });

console.log(`Penny API listening on ${server.url}`);
if (!google) console.log("Google sign-in is off: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
