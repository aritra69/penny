import { createAuth } from "./auth.ts";
import { createExtractor } from "./capture/index.ts";
import { DEFAULT_AUTH_URL, DEFAULT_DATABASE_URL, DEFAULT_PORT } from "./constants/index.ts";
import { openDb } from "./db.ts";
import { startServer } from "./server.ts";
import { createVault } from "./vault.ts";

const env = Bun.env;

if (!env.BETTER_AUTH_SECRET) {
  throw new Error(
    "BETTER_AUTH_SECRET is not set. Copy .env.example to .env at the repo root and fill it in.",
  );
}

if (!env.DATA_ENCRYPTION_KEY) {
  throw new Error(
    "DATA_ENCRYPTION_KEY is not set. Generate one with `openssl rand -base64 32` and add it to .env.",
  );
}
const vault = createVault(env.DATA_ENCRYPTION_KEY);

const google =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }
    : undefined;

const databaseUrl = env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
const db = await openDb(databaseUrl).catch((cause) => {
  throw new Error("Couldn't reach Postgres. Start it with `bun run db:up` from the repo root.", {
    cause,
  });
});
const auth = createAuth(db, {
  baseURL: env.BETTER_AUTH_URL ?? DEFAULT_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  google,
  infraApiKey: env.BETTER_AUTH_API_KEY,
});
// Reading bank messages needs OpenAI; @ai-sdk/openai reads OPENAI_API_KEY itself.
const extract = env.OPENAI_API_KEY ? createExtractor() : undefined;
const server = startServer({ db, auth, vault, port: Number(env.PORT ?? DEFAULT_PORT), extract });

console.log(`Penny API listening on ${server.url}`);
if (!google) console.log("Google sign-in is off: set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
if (!extract) console.log("Reading bank messages is off: set OPENAI_API_KEY.");
