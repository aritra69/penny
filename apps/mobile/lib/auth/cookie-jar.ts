import { parseSetCookieHeader } from "better-auth/cookies/utils";

/**
 * The API's cookies, kept by the app instead of the platform's cookie store: React Native's
 * networking would otherwise share one jar across every request and can't be read or cleared
 * reliably. Stored as JSON: `{ [name]: { value, expires } }`.
 */
export type CookieJar = Record<string, { value: string; expires: string | null }>;

const parseJar = (json: string | null | undefined): CookieJar => {
  if (!json) return {};
  try {
    const parsed: unknown = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as CookieJar) : {};
  } catch {
    return {};
  }
};

/** Applies a `Set-Cookie` header to the stored jar, dropping cookies it expires. */
export function applySetCookie(
  setCookieHeader: string,
  storedJar: string | null,
  now = Date.now(),
): string {
  const jar = parseJar(storedJar);
  parseSetCookieHeader(setCookieHeader).forEach((cookie, name) => {
    const maxAge = cookie["max-age"];
    if (maxAge !== undefined && Number(maxAge) <= 0) {
      delete jar[name];
      return;
    }
    const expires = maxAge
      ? new Date(now + Number(maxAge) * 1000)
      : cookie.expires
        ? new Date(String(cookie.expires))
        : null;
    if (expires && expires.getTime() <= now) {
      delete jar[name];
      return;
    }
    jar[name] = { value: cookie.value, expires: expires ? expires.toISOString() : null };
  });
  return JSON.stringify(jar);
}

/** The `Cookie` request header for the stored jar, skipping expired cookies. */
export function cookieHeader(storedJar: string | null, now = Date.now()): string {
  return Object.entries(parseJar(storedJar))
    .filter(([, cookie]) => !cookie.expires || new Date(cookie.expires).getTime() > now)
    .map(([name, cookie]) => `${name}=${cookie.value}`)
    .join("; ");
}

/** Whether a `Set-Cookie` header carries Better Auth's session cookies (not a third party's). */
export function hasSessionCookies(setCookieHeader: string, cookiePrefix = "better-auth"): boolean {
  return [...parseSetCookieHeader(setCookieHeader).keys()].some((name) =>
    name.replace(/^__(Secure|Host)-/, "").startsWith(cookiePrefix),
  );
}

/** Whether the session itself changed between two jars (not just its expiry). */
export function sessionChanged(previousJar: string | null, nextJar: string): boolean {
  const previous = parseJar(previousJar);
  const next = parseJar(nextJar);
  const names = new Set(
    [...Object.keys(previous), ...Object.keys(next)].filter(
      (name) => name.includes("session_token") || name.includes("session_data"),
    ),
  );
  return [...names].some((name) => previous[name]?.value !== next[name]?.value);
}
