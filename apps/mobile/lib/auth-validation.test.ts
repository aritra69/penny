import { describe, expect, test } from "vitest";

import { checkEmail, checkName, checkNewPassword, checkPassword } from "./auth-validation";

describe("auth field checks", () => {
  test("checkName wants something other than spaces", () => {
    expect(checkName("  ")).toBe("Enter your name.");
    expect(checkName("Asha")).toBeNull();
  });

  test("checkEmail trims before checking", () => {
    expect(checkEmail(" asha@penny.app ")).toBeNull();
    expect(checkEmail("asha@penny")).toMatch(/valid email/);
  });

  test("checkPassword only needs something typed", () => {
    expect(checkPassword("")).toBe("Enter your password.");
    expect(checkPassword("x")).toBeNull();
  });

  test("checkNewPassword asks for one, then for 8 characters", () => {
    expect(checkNewPassword("")).toBe("Enter a password.");
    expect(checkNewPassword("short")).toMatch(/8 characters/);
    expect(checkNewPassword("long enough")).toBeNull();
  });
});
