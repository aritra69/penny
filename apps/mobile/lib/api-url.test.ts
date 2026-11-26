import { describe, expect, test } from "vitest";

import { resolveApiUrl } from "./api-url";

const BUNDLE = "http://192.168.1.5:8081/index.bundle?platform=android&dev=true";

describe("resolveApiUrl", () => {
  test("prefers the env var and drops trailing slashes", () => {
    expect(resolveApiUrl("https://api.penny.app/", BUNDLE)).toBe("https://api.penny.app");
  });

  test("falls back to the dev server's host on the API port", () => {
    expect(resolveApiUrl(undefined, BUNDLE)).toBe("http://192.168.1.5:4000");
    expect(resolveApiUrl(undefined, "http://10.0.2.2:8081/index.bundle")).toBe(
      "http://10.0.2.2:4000",
    );
  });

  test("falls back to localhost without a dev server", () => {
    expect(resolveApiUrl(undefined, undefined)).toBe("http://localhost:4000");
    expect(resolveApiUrl("", "")).toBe("http://localhost:4000");
    // Release builds load the bundle from the APK.
    expect(resolveApiUrl(undefined, "assets://index.android.bundle")).toBe("http://localhost:4000");
  });
});
