import { describe, expect, test } from "vitest";

import { resolveApiUrl } from "./api-url";

describe("resolveApiUrl", () => {
  test("prefers the env var and drops trailing slashes", () => {
    expect(resolveApiUrl("https://api.penny.app/", "192.168.1.5:8081")).toBe(
      "https://api.penny.app",
    );
  });

  test("falls back to the dev server's host on the API port", () => {
    expect(resolveApiUrl(undefined, "192.168.1.5:8081")).toBe("http://192.168.1.5:4000");
  });

  test("falls back to localhost", () => {
    expect(resolveApiUrl(undefined, undefined)).toBe("http://localhost:4000");
    expect(resolveApiUrl("", "")).toBe("http://localhost:4000");
  });
});
