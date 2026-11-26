import { describe, expect, test } from "bun:test";
import { toMinorUnits } from "./money.ts";

describe("toMinorUnits", () => {
  test.each([
    ["249", 24900],
    ["249.5", 24950],
    ["1,249.50", 124950],
    ["1,20,450.00", 12045000],
    ["0.10", 10],
    ["12.300", 1230],
  ])("%p INR → %p", (amount, minor) => {
    expect(toMinorUnits(amount, "INR")).toBe(minor);
  });

  test.each(["", "abc", "-249", "12.345", "0", "0.00", "1e5", "₹249"])("rejects %p", (amount) => {
    expect(toMinorUnits(amount, "INR")).toBeNull();
  });
});
