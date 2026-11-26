import { describe, expect, it } from "vitest";

import {
  applySetCookie,
  cookieHeader,
  hasSessionCookies,
  sessionChanged,
} from "@/lib/auth/cookie-jar";

const NOW = Date.UTC(2026, 10, 26);

describe("applySetCookie", () => {
  it("stores a cookie with its expiry from max-age", () => {
    const jar = JSON.parse(applySetCookie("better-auth.session_token=abc; Max-Age=60", null, NOW));
    expect(jar).toEqual({
      "better-auth.session_token": { value: "abc", expires: new Date(NOW + 60_000).toISOString() },
    });
  });

  it("keeps other cookies and replaces a changed one", () => {
    const first = applySetCookie("a=1, b=2", null, NOW);
    const next = JSON.parse(applySetCookie("b=3", first, NOW));
    expect(next.a.value).toBe("1");
    expect(next.b.value).toBe("3");
  });

  it("drops a cookie the server expires", () => {
    const first = applySetCookie("better-auth.session_token=abc", null, NOW);
    const cleared = applySetCookie("better-auth.session_token=; Max-Age=0", first, NOW);
    expect(JSON.parse(cleared)).toEqual({});
  });

  it("starts over from a corrupt stored jar", () => {
    expect(JSON.parse(applySetCookie("a=1", "not json", NOW))).toEqual({
      a: { value: "1", expires: null },
    });
  });
});

describe("cookieHeader", () => {
  it("joins live cookies and skips expired ones", () => {
    const jar = JSON.stringify({
      a: { value: "1", expires: null },
      b: { value: "2", expires: new Date(NOW + 1000).toISOString() },
      c: { value: "3", expires: new Date(NOW - 1000).toISOString() },
    });
    expect(cookieHeader(jar, NOW)).toBe("a=1; b=2");
  });

  it("is empty with nothing stored", () => {
    expect(cookieHeader(null)).toBe("");
  });
});

describe("hasSessionCookies", () => {
  it("matches Better Auth's cookies, with or without the secure prefix", () => {
    expect(hasSessionCookies("better-auth.session_token=abc")).toBe(true);
    expect(hasSessionCookies("__Secure-better-auth.session_token=abc")).toBe(true);
    expect(hasSessionCookies("_ga=GA1.2")).toBe(false);
  });
});

describe("sessionChanged", () => {
  const jar = (token: string, expires: string | null = null) =>
    JSON.stringify({ "better-auth.session_token": { value: token, expires } });

  it("ignores a refreshed expiry", () => {
    expect(sessionChanged(jar("abc", "2026-01-01"), jar("abc", "2026-02-01"))).toBe(false);
  });

  it("sees a new or removed session", () => {
    expect(sessionChanged(null, jar("abc"))).toBe(true);
    expect(sessionChanged(jar("abc"), jar("def"))).toBe(true);
    expect(sessionChanged(jar("abc"), "{}")).toBe(true);
  });
});
