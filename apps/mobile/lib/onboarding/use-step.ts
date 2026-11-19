import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";

import type { OnboardingStep } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";

/**
 * Call at the top of an onboarding screen. Records the screen as the place to come back to, and
 * returns `back`: the previous screen in the stack, or `previous` when setup was reopened here
 * and there is nothing behind it.
 */
export function useOnboardingStep(step: OnboardingStep, previous?: OnboardingStep) {
  const router = useRouter();
  const { update } = useOnboarding();

  useFocusEffect(
    useCallback(() => {
      update({ step });
    }, [update, step]),
  );

  const back = useCallback(() => {
    if (router.canGoBack()) router.back();
    else if (previous) router.replace(`/${previous}`);
  }, [router, previous]);

  return { back };
}
