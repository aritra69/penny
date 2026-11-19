import type { BudgetSuggestions } from "@/lib/device/types";

/** Budget amounts by category id, in minor units. */
export type BudgetAmounts = Record<string, number>;

/** The suggested amounts, with any the user already changed laid over them. */
export function startingAmounts(
  suggestions: BudgetSuggestions,
  saved: BudgetAmounts = {},
): BudgetAmounts {
  return Object.fromEntries(suggestions.categories.map((c) => [c.id, saved[c.id] ?? c.suggested]));
}

/** One tap of − or +. A budget never drops below one step. */
export function nudge(amount: number, direction: -1 | 1, step: number): number {
  return Math.max(step, amount + direction * step);
}

export const canDecrease = (amount: number, step: number) => amount > step;

/** The month's plan: category budgets, plus bills, plus what's left for everything else. */
export function monthlyTotal(suggestions: BudgetSuggestions, amounts: BudgetAmounts): number {
  const categories = suggestions.categories.reduce(
    (sum, c) => sum + (amounts[c.id] ?? c.suggested),
    0,
  );
  return categories + suggestions.bills + suggestions.everythingElse;
}
