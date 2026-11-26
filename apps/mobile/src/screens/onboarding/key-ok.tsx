import { useEffect } from "react";

import {
  IllustrationSlot,
  OnboardingScreen,
  ResultIntro,
} from "@/components/onboarding/onboarding-screen";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { formatLatency } from "@/lib/openai";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, Text } from "@repo/design-system";

export default function KeyWorksScreen() {
  useOnboardingStep("key-ok");
  const navigation = useAppNavigation();
  const { state } = useOnboarding();

  // Reopened here without a checked key (e.g. the key was cleared): go back to entering one.
  useEffect(() => {
    if (!state.keyCheck) navigation.replace("key");
  }, [navigation, state.keyCheck]);

  if (!state.keyCheck) return null;
  const { model, latencyMs } = state.keyCheck;

  return (
    <OnboardingScreen
      footer={
        <Button size="lg" onPress={() => navigation.push("apps")}>
          <Text>Next</Text>
        </Button>
      }
    >
      <IllustrationSlot
        source={require("@/assets/illustrations/hero-key.png")}
        height={233}
        className="mt-16"
      />
      <ResultIntro title="Your key works">
        Reached {model} in {formatLatency(latencyMs)}. It&apos;s saved encrypted on this phone.
      </ResultIntro>
    </OnboardingScreen>
  );
}
