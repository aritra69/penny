import { describe, expect, test } from "vitest";

import {
  checkEmail,
  checkName,
  checkNewPassword,
  hasErrors,
  validateSignIn,
  validateSignUp,
} from "./auth-validation";

describe("validateSignIn", () => {
  test("accepts a valid email and any password", () => {
    expect(validateSignIn({ email: " me@penny.app ", password: "x" })).toEqual({});
  });

  test("flags a bad email and an empty password", () => {
    const errors = validateSignIn({ email: "me@penny", password: "" });
    expect(Object.keys(errors).sort()).toEqual(["email", "password"]);
  });
});

describe("validateSignUp", () => {
  const valid = { name: "Asha", email: "asha@penny.app", password: "long enough" };

  test("accepts a complete form", () => {
    expect(hasErrors(validateSignUp(valid))).toBe(false);
  });

  test("needs a name and a password of at least 8 characters", () => {
    const errors = validateSignUp({ ...valid, name: "  ", password: "short" });
    expect(errors.name).toBeDefined();
    expect(errors.password).toMatch(/8 characters/);
  });
});

describe("sign-up steps", () => {
  test("checkName wants something other than spaces", () => {
    expect(checkName("  ")).toBe("Enter your name.");
    expect(checkName("Asha")).toBeNull();
  });

  test("checkEmail trims before checking", () => {
    expect(checkEmail(" asha@penny.app ")).toBeNull();
    expect(checkEmail("asha@penny")).toMatch(/valid email/);
  });

  test("checkNewPassword asks for one, then for 8 characters", () => {
    expect(checkNewPassword("")).toBe("Enter a password.");
    expect(checkNewPassword("short")).toMatch(/8 characters/);
    expect(checkNewPassword("long enough")).toBeNull();
  });
});
