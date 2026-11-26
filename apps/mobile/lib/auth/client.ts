import { sentinelNativeClient } from "@better-auth/infra/native";
import type { BetterAuthClientPlugin } from "better-auth";
import { createAuthClient } from "better-auth/react";
import { NativeModules } from "react-native";

import { resolveApiUrl } from "@/lib/api-url";
import { nativeClient } from "@/lib/auth/native-client";
import * as SecureStorage from "@/lib/secure-storage";

export const APP_SCHEME = "penny";

/** The Metro dev server's URL (e.g. http://192.168.1.5:8081/index.bundle…); null in release builds. */
const bundleUrl: string | undefined = NativeModules.SourceCode?.getConstants?.().scriptURL;

export const API_URL = resolveApiUrl(process.env.RN_PUBLIC_API_URL, bundleUrl);

/** Keychain service names: Penny's prefix and only [A-Za-z0-9._-]. */
const secureKey = (key: string) => `${APP_SCHEME}.${key.replace(/[^\w.-]/g, "_")}`;

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    // Keeps the session cookie in the Keychain and sends it with every request.
    nativeClient({ origin: `${APP_SCHEME}://`, storagePrefix: APP_SCHEME }),
    // Better Auth Infrastructure: bot / credential-stuffing protection (pairs with sentinel() on the API).
    // Its declared type has an empty `$InferServerPlugin`, which collapses the inferred session to `never`.
    sentinelNativeClient({
      // Per-project ingestion URL from the Better Auth dashboard (project settings).
      identifyUrl: process.env.RN_PUBLIC_BETTER_AUTH_KV_URL || undefined,
      autoSolveChallenge: true,
      storage: {
        getItem: (key) => SecureStorage.getItem(secureKey(key)),
        setItem: (key, value) => SecureStorage.setItem(secureKey(key), value),
      },
    }) as Omit<BetterAuthClientPlugin, "$InferServerPlugin">,
  ],
});

/** Session cookie for calling the API's own routes (e.g. /transactions) with `fetch`. */
export const authHeaders = async (): Promise<Record<string, string>> => {
  const cookie = await authClient.getCookie();
  return cookie ? { Cookie: cookie } : {};
};
