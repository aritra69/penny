import type { Plan } from "@/lib/onboarding/state";

/**
 * What each plan costs, in minor units. Display only for now: nothing is charged yet, and
 * these are not wired to a store or a payment provider.
 */
export const PLAN_PRICES: Record<
  Plan,
  { amount: number; currency: string; every: "month" | null }
> = {
  subscription: { amount: 199, currency: "USD", every: "month" },
  "own-key": { amount: 1499, currency: "USD", every: null },
};
