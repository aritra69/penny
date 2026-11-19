import { describe, expect, it } from "vitest";

import { createFakeDevice } from "@/lib/device/fake";
import { canDecrease, monthlyTotal, nudge, startingAmounts } from "@/lib/onboarding/budgets";

describe("budgets", async () => {
  const suggestions = await createFakeDevice().suggestBudgets();
  const step = suggestions.step;

  it("starts from the suggestions, keeping what the user changed", () => {
    const amounts = startingAmounts(suggestions, { food: 900000 });
    expect(amounts.food).toBe(900000);
    expect(amounts.groceries).toBe(600000);
    expect(Object.keys(amounts)).toHaveLength(suggestions.categories.length);
  });

  it("adds bills and everything else to the category budgets", () => {
    // The design's sample month: ₹25,000 of budgets + ₹9,000 bills + ₹6,000 = ₹40,000.
    expect(monthlyTotal(suggestions, startingAmounts(suggestions))).toBe(4000000);
    expect(monthlyTotal(suggestions, startingAmounts(suggestions, { food: 850000 }))).toBe(4050000);
  });

  it("moves by one step and stops at one step", () => {
    expect(nudge(800000, 1, step)).toBe(850000);
    expect(nudge(800000, -1, step)).toBe(750000);
    expect(nudge(step, -1, step)).toBe(step);
    expect(canDecrease(step, step)).toBe(false);
    expect(canDecrease(step * 2, step)).toBe(true);
  });
});
