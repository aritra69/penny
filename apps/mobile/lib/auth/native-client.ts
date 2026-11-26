import type { BetterAuthClientPlugin, ClientStore, FocusManager } from "better-auth/client";
import { kFocusManager } from "better-auth/client";
import { AppState } from "react-native";

import {
  applySetCookie,
  cookieHeader,
  hasSessionCookies,
  sessionChanged,
} from "@/lib/auth/cookie-jar";
import * as SecureStorage from "@/lib/secure-storage";

type NativeClientOptions = {
  /** Sent as `Origin`, which native requests don't have. Must be in the API's `trustedOrigins`. */
  origin: string;
  /** Prefix for the secure-storage keys. */
  storagePrefix: string;
};

/** Refetches the session when the app comes back to the foreground, like a browser tab does. */
function installFocusManager() {
  const globals = globalThis as { [kFocusManager]?: FocusManager };
  if (globals[kFocusManager]) return;
  const listeners = new Set<(focused: boolean) => void>();
  globals[kFocusManager] = {
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setFocused(focused) {
      listeners.forEach((listener) => listener(focused));
    },
    setup() {
      const subscription = AppState.addEventListener("change", (state) => {
        listeners.forEach((listener) => listener(state === "active"));
      });
      return () => subscription.remove();
    },
  };
}

/**
 * Better Auth on React Native. Replaces `@better-auth/expo`'s client: keeps the session cookie in
 * secure storage and sends it with every request, gives requests an `Origin`, and caches the last
 * session so the app opens signed in without waiting for the network.
 *
 * Google sign-in doesn't go through a browser here: `GoogleButton` gets an ID token from the
 * native Google SDK and posts it to `signIn.social`, so there is no redirect to catch.
 */
export function nativeClient({ origin, storagePrefix }: NativeClientOptions) {
  installFocusManager();

  const cookieKey = `${storagePrefix}.cookie`;
  const sessionKey = `${storagePrefix}.session`;
  let store: ClientStore | null = null;

  // Reads and writes of the jar run one at a time, so overlapping responses can't drop a cookie.
  let jarQueue: Promise<unknown> = Promise.resolve();
  const withJar = <T>(task: () => Promise<T>): Promise<T> => {
    const run = jarQueue.then(task, task);
    jarQueue = run.catch(() => undefined);
    return run;
  };
  const readJar = () => withJar(() => SecureStorage.getItem(cookieKey));

  let hydrated: Promise<void> | null = null;
  /** Shows the last saved session while `/get-session` is still in flight. */
  const hydrateSession = () => {
    hydrated ??= (async () => {
      const atom = store?.atoms.session;
      if (!atom || atom.get().data !== null) return;
      const initial = atom.get();
      const cached = JSON.parse((await SecureStorage.getItem(sessionKey)) || "null");
      const expiresAt = new Date(cached?.session?.expiresAt ?? NaN).getTime();
      if (cached?.user?.id && expiresAt > Date.now() && atom.get() === initial) {
        atom.set({ ...initial, data: cached, error: null });
      }
    })().catch(() => {
      hydrated = null;
    });
    return hydrated;
  };

  const clearSession = async () => {
    await withJar(() => SecureStorage.deleteItem(cookieKey));
    await SecureStorage.deleteItem(sessionKey);
    const atom = store?.atoms.session;
    atom?.set({ ...atom.get(), data: null, error: null, isPending: false });
  };

  return {
    id: "penny-native",
    getActions(_fetch, $store) {
      store = $store;
      return {
        /** The session cookie, for calling the API's own routes with `fetch`. */
        getCookie: async () => cookieHeader(await readJar()),
      };
    },
    fetchPlugins: [
      {
        id: "penny-native",
        name: "Penny native",
        async init(url, options) {
          const { pathname } = new URL(url, options?.baseURL);
          if (pathname.endsWith("/get-session")) await hydrateSession();
          // Read before a sign-out clears it: the API needs the cookie to end the session.
          const cookie = cookieHeader(await readJar());
          if (pathname.endsWith("/sign-out")) await clearSession();
          return {
            url,
            options: {
              ...options,
              // Keep the platform's own cookie store out of it: the jar above is the only one.
              credentials: "omit",
              headers: { ...options?.headers, ...(cookie ? { cookie } : {}), origin },
            },
          };
        },
        hooks: {
          async onSuccess(context) {
            const { pathname } = new URL(context.request.url);
            const setCookie = context.response.headers.get("set-cookie");
            if (setCookie && hasSessionCookies(setCookie)) {
              const changed = await withJar(async () => {
                const previous = await SecureStorage.getItem(cookieKey);
                const next = applySetCookie(setCookie, previous);
                await SecureStorage.setItem(cookieKey, next);
                return sessionChanged(previous, next);
              });
              if (changed) store?.notify("$sessionSignal");
            }
            if (pathname.endsWith("/get-session")) {
              if (context.data) {
                await SecureStorage.setItem(sessionKey, JSON.stringify(context.data));
              } else {
                await SecureStorage.deleteItem(sessionKey);
              }
            }
          },
        },
      },
    ],
  } satisfies BetterAuthClientPlugin;
}
