export const API_PORT = 4000;

/**
 * Where the Penny API lives.
 *
 * 1. `EXPO_PUBLIC_API_URL`, if set (required for production builds).
 * 2. In development, the machine running the Expo dev server, on the API's port. Expo reports it
 *    as `hostUri` (e.g. `192.168.1.5:8081`), so a phone on the same Wi-Fi reaches it.
 * 3. `localhost`, e.g. with `adb reverse tcp:4000 tcp:4000`.
 */
export function resolveApiUrl(envUrl: string | undefined, hostUri: string | undefined): string {
  if (envUrl) return envUrl.replace(/\/+$/, "");
  const host = hostUri?.split(":")[0];
  return `http://${host || "localhost"}:${API_PORT}`;
}
