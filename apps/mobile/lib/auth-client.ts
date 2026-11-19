import { expoClient } from "@better-auth/expo/client";
import { sentinelNativeClient } from "@better-auth/infra/native";
import type { BetterAuthClientPlugin } from "better-auth";
import { createAuthClient } from "better-auth/react";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

import { resolveApiUrl } from "@/lib/api-url";

export const APP_SCHEME = "penny";

export const API_URL = resolveApiUrl(
  process.env.EXPO_PUBLIC_API_URL,
  Constants.expoConfig?.hostUri,
);

/** SecureStore only allows [A-Za-z0-9._-] in keys. */
const secureKey = (key: string) => `${APP_SCHEME}.${key.replace(/[^\w.-]/g, "_")}`;

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    // Keeps the session cookie in SecureStore and handles the Google redirect back into the app.
    expoClient({ scheme: APP_SCHEME, storagePrefix: APP_SCHEME, storage: SecureStore }),
    // Better Auth Infrastructure: bot / credential-stuffing protection (pairs with sentinel() on the API).
    // Its declared type has an empty `$InferServerPlugin`, which collapses the inferred session to `never`.
    sentinelNativeClient({
      // Per-project ingestion URL from the Better Auth dashboard (project settings).
      identifyUrl: process.env.EXPO_PUBLIC_BETTER_AUTH_KV_URL || undefined,
      autoSolveChallenge: true,
      storage: {
        getItem: (key) => SecureStore.getItemAsync(secureKey(key)),
        setItem: (key, value) => SecureStore.setItemAsync(secureKey(key), value),
      },
    }) as Omit<BetterAuthClientPlugin, "$InferServerPlugin">,
  ],
});

/** Session cookie for calling the API's own routes (e.g. /transactions) with `fetch`. */
export const authHeaders = async (): Promise<Record<string, string>> => {
  const cookie = await authClient.getCookie();
  return cookie ? { Cookie: cookie } : {};
};
