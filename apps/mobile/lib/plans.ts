import type { Plan } from "@/lib/onboarding/state";
import { formatMoney } from "@repo/design-system";

/**
 * What each plan costs, in minor units (paise). Billing will go through Google Play; until Play
 * Billing is wired up (see `payments.ts`) these are display prices and nothing is charged.
 *
 * - "subscription": Penny Plus. A free month (`TRIAL_DAYS` in `trial.ts`), then ₹149 a month.
 * - "own-key": the user brings their own OpenAI key and pays ₹999 once. No free month.
 */
export const PLAN_PRICES: Record<
  Plan,
  { amount: number; currency: string; every: "month" | null }
> = {
  subscription: { amount: 14900, currency: "INR", every: "month" },
  "own-key": { amount: 99900, currency: "INR", every: null },
};

export const PLAN_NAMES: Record<Plan, string> = {
  subscription: "Penny Plus",
  "own-key": "Your own OpenAI key",
};

/** "₹149", "₹999". */
export const planAmount = (plan: Plan) =>
  formatMoney(PLAN_PRICES[plan].amount, PLAN_PRICES[plan].currency);

/** "₹149 a month", "₹999 once". */
export const planPrice = (plan: Plan) => {
  const { every } = PLAN_PRICES[plan];
  return every ? `${planAmount(plan)} a ${every}` : `${planAmount(plan)} once`;
};

/** "about ₹5 a day": Penny Plus spread over a 30-day month, to the nearest rupee. */
export const dailyPrice = () => {
  const { amount, currency } = PLAN_PRICES.subscription;
  return `about ${formatMoney(Math.round(amount / 30 / 100) * 100, currency)} a day`;
};
