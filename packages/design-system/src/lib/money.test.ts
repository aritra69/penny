import { describe, expect, it } from "vitest";

import { currencySymbol, formatMoney, formatMoneyCompact } from "./money";

const MINUS = "−";

describe("formatMoney", () => {
  it("groups rupees in lakhs and drops whole paise", () => {
    expect(formatMoney(18_240_000, "INR")).toBe("₹1,82,400");
    expect(formatMoney(1_422_200, "INR")).toBe("₹14,222");
  });

  it("writes money out with a real minus and a space", () => {
    expect(formatMoney(-38_600, "INR")).toBe(`${MINUS} ₹386`);
  });

  it("adds a plus only when asked", () => {
    expect(formatMoney(89_900, "INR")).toBe("₹899");
    expect(formatMoney(89_900, "INR", { sign: "always" })).toBe("+ ₹899");
    expect(formatMoney(-89_900, "INR", { sign: "never" })).toBe("₹899");
    expect(formatMoney(0, "INR", { sign: "always" })).toBe("₹0");
  });

  it("keeps fractions that are not whole", () => {
    expect(formatMoney(1250, "USD")).toBe("$12.50");
    expect(formatMoney(1200, "USD")).toBe("$12");
    expect(formatMoney(1200, "USD", { trimWholeFraction: false })).toBe("$12.00");
  });

  it("handles currencies without minor units", () => {
    expect(formatMoney(1500, "JPY")).toBe("¥1,500");
  });
});

describe("formatMoneyCompact", () => {
  it("uses lakh and crore for rupees", () => {
    expect(formatMoneyCompact(30_000_000, "INR")).toBe("₹3L");
    expect(formatMoneyCompact(4_000_000, "INR")).toBe("₹40k");
    expect(formatMoneyCompact(1_200_000_000, "INR")).toBe("₹1.2Cr");
    expect(formatMoneyCompact(85_000, "INR")).toBe("₹850");
  });

  it("uses k, M and B elsewhere", () => {
    expect(formatMoneyCompact(250_000_000, "USD")).toBe("$2.5M");
    expect(formatMoneyCompact(-1_250_000, "USD")).toBe(`${MINUS} $12.5k`);
  });

  it("rounds down so a goal never looks further along than it is", () => {
    expect(formatMoneyCompact(29_990_000, "INR")).toBe("₹2.9L");
  });
});

describe("currencySymbol", () => {
  it("returns the symbol", () => {
    expect(currencySymbol("INR")).toBe("₹");
    expect(currencySymbol("EUR")).toBe("€");
  });
});
