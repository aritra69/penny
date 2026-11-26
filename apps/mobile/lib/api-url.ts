export const API_PORT = 4000;

/**
 * Where the Penny API lives.
 *
 * 1. `RN_PUBLIC_API_URL`, if set (required for release builds).
 * 2. In development, the machine running Metro, on the API's port. The app loads its bundle from
 *    there (e.g. `http://192.168.1.5:8081/index.bundle?…`, or `10.0.2.2` on an emulator), so a
 *    phone that reaches Metro reaches the API too.
 * 3. `localhost`, e.g. with `adb reverse tcp:4000 tcp:4000` (`bun run adb:reverse`).
 */
export function resolveApiUrl(envUrl: string | undefined, bundleUrl: string | undefined): string {
  if (envUrl) return envUrl.replace(/\/+$/, "");
  const host = bundleUrl?.match(/^https?:\/\/([^/:?#]+)/)?.[1];
  return `http://${host || "localhost"}:${API_PORT}`;
}
