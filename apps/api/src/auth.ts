import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { dash, sentinel } from "@better-auth/infra";
import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { APP_NAME, APP_SCHEME, MIN_PASSWORD_LENGTH } from "./constants/index.ts";
import type { Db } from "./db.ts";
import * as schema from "./schema.ts";

export type AuthConfig = {
  /** Public URL of this API, e.g. http://localhost:4000. OAuth callbacks are built from it. */
  baseURL: string;
  /** At least 32 random characters. Signs session cookies. */
  secret: string;
  /** Google sign-in is off until both are set. The mobile app signs in with Google ID tokens issued for this client ID. */
  google?: { clientId: string; clientSecret: string };
  /** Better Auth Infrastructure key. Enables the dashboard and Sentinel abuse protection. */
  infraApiKey?: string;
};

export function createAuth(db: Db, config: AuthConfig) {
  const plugins: BetterAuthPlugin[] = [];
  if (config.infraApiKey) {
    plugins.push(
      dash({ apiKey: config.infraApiKey }),
      sentinel({
        apiKey: config.infraApiKey,
        security: { credentialStuffing: { enabled: true, thresholds: { challenge: 3, block: 5 } } },
      }),
    );
  }

  return betterAuth({
    appName: APP_NAME,
    baseURL: config.baseURL,
    secret: config.secret,
    database: drizzleAdapter(db, { provider: "pg", schema, usePlural: true }),
    advanced: {
      database: { generateId: "uuid" },
      // Better Auth turns origin checks off when NODE_ENV is "test"; keep them on so the tests
      // cover the same rules as production (e.g. the mobile app's penny:// origin).
      disableOriginCheck: false,
    },
    // The mobile app sends `Origin: penny://` (apps/mobile/lib/auth/native-client.ts).
    trustedOrigins: [`${APP_SCHEME}://`],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      autoSignIn: true,
    },
    socialProviders: config.google
      ? { google: { ...config.google, prompt: "select_account" } }
      : {},
    plugins,
  });
}

export type Auth = ReturnType<typeof createAuth>;
