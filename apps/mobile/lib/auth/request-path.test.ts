import { describe, expect, it } from "vitest";

import { isRoute } from "./request-path";

describe("isRoute", () => {
  it("matches a full URL string", () => {
    expect(isRoute("http://localhost:4000/api/auth/get-session", "/get-session")).toBe(true);
  });

  it("matches a URL object, which better-fetch passes to hooks", () => {
    expect(isRoute(new URL("http://localhost:4000/api/auth/sign-out"), "/sign-out")).toBe(true);
  });

  it("matches a path relative to the base URL", () => {
    expect(isRoute("/get-session", "/get-session")).toBe(true);
  });

  it("ignores the query and hash", () => {
    expect(
      isRoute("http://localhost:4000/api/auth/get-session?disableCookieCache=true", "/get-session"),
    ).toBe(true);
    expect(isRoute("http://localhost:4000/api/auth/sign-in/email#x", "/sign-in/email")).toBe(true);
  });

  it("doesn't match another route", () => {
    expect(isRoute("http://localhost:4000/api/auth/sign-in/email", "/get-session")).toBe(false);
    expect(isRoute("http://localhost:4000/api/auth/list?next=/get-session", "/get-session")).toBe(
      false,
    );
  });
});
