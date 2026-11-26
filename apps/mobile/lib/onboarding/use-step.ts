import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import type { OnboardingStep } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import { useAppNavigation } from "@/src/navigation/types";

/**
 * Call at the top of an onboarding screen. Records the screen as the place to come back to, and
 * returns `back`: the previous screen in the stack, or `previous` when setup was reopened here
 * and there is nothing behind it.
 */
export function useOnboardingStep(step: OnboardingStep, previous?: OnboardingStep) {
  const navigation = useAppNavigation();
  const { update } = useOnboarding();

  useFocusEffect(
    useCallback(() => {
      update({ step });
    }, [update, step]),
  );

  const back = useCallback(() => {
    if (navigation.canGoBack()) navigation.goBack();
    else if (previous) navigation.replace(previous);
  }, [navigation, previous]);

  return { back };
}
