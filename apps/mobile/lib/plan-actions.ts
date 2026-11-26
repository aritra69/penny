import { useCallback, useState } from "react";

import type { OnboardingState, Plan } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import { purchasePlan, restorePurchases, type RestoreResult } from "@/lib/payments";
import { trialDates } from "@/lib/trial";
import { scheduleTrialReminder } from "@/lib/trial-reminder";

/**
 * Buying and restoring plans from a screen: runs the (stub) Google Play purchase, records the
 * result in the saved state, and keeps a busy flag and an error line for the screen to show.
 */
export function usePlanActions() {
  const { state, update } = useOnboarding();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Buys `plan` unless it's already bought. True when the user now has it. */
  const buy = useCallback(
    async (plan: Plan): Promise<boolean> => {
      setError(null);
      if (state.paidPlan === plan) {
        update({ plan });
        return true;
      }
      setBusy(true);
      const result = await purchasePlan(plan).finally(() => setBusy(false));
      if (result === "cancelled") return false;
      if (result === "failed") {
        setError("The purchase didn't go through. Nothing was charged. Try again.");
        return false;
      }
      const patch: Partial<OnboardingState> = { plan, paidPlan: plan };
      // Starting Penny Plus starts the free month. Switching to the own key later keeps its dates:
      // the month already given runs to its end.
      // TODO(play-billing): on that switch the server must also cancel the Play subscription
      // (Google Play Developer API), so Plus never charges; and cancel the day-28 reminder.
      if (plan === "subscription" && !state.trialEndsAt) {
        const trial = trialDates(new Date());
        patch.trialStartedAt = trial.startedAt;
        patch.trialEndsAt = trial.endsAt;
        scheduleTrialReminder(trial.endsAt);
      }
      update(patch);
      return true;
    },
    [state.paidPlan, state.trialEndsAt, update],
  );

  /** Restores a plan bought earlier on this Google account. Returns what was found. */
  const restore = useCallback(async (): Promise<RestoreResult> => {
    setError(null);
    setBusy(true);
    const result = await restorePurchases().finally(() => setBusy(false));
    if (result === "none") setError("No Penny purchase found on this Google account.");
    if (result === "subscription" || result === "own-key") {
      update({ plan: result, paidPlan: result });
    }
    return result;
  }, [update]);

  return { buy, restore, busy, error };
}
