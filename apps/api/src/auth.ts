import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { expo } from "@better-auth/expo";
import { dash, sentinel } from "@better-auth/infra";
import { betterAuth, type BetterAuthPlugin } from "better-auth";
import {
  APP_NAME,
  APP_SCHEME,
  DEV_TRUSTED_ORIGINS,
  MIN_PASSWORD_LENGTH,
} from "./constants/index.ts";
import type { Db } from "./db.ts";
import * as schema from "./schema.ts";

export type AuthConfig = {
  /** Public URL of this API, e.g. http://localhost:4000. OAuth callbacks are built from it. */
  baseURL: string;
  /** At least 32 random characters. Signs session cookies. */
  secret: string;
  /** Lets Expo Go's `exp://` deep links back in after Google sign-in. Never in production. */
  dev?: boolean;
  /** Google sign-in is off until both are set. */
  google?: { clientId: string; clientSecret: string };
  /** Better Auth Infrastructure key. Enables the dashboard and Sentinel abuse protection. */
  infraApiKey?: string;
};

export function createAuth(db: Db, config: AuthConfig) {
  const plugins: BetterAuthPlugin[] = [expo()];
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
    advanced: { database: { generateId: "uuid" } },
    trustedOrigins: [`${APP_SCHEME}://`, ...(config.dev ? DEV_TRUSTED_ORIGINS : [])],
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
