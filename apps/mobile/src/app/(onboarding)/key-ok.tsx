import { Redirect, useRouter } from "expo-router";

import {
  IllustrationSlot,
  OnboardingScreen,
  ResultIntro,
} from "@/components/onboarding/onboarding-screen";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { formatLatency } from "@/lib/openai";
import { Button, Text } from "@repo/design-system";

export default function KeyWorksScreen() {
  useOnboardingStep("key-ok");
  const router = useRouter();
  const { state } = useOnboarding();

  if (!state.keyCheck) return <Redirect href="/key" />;
  const { model, latencyMs } = state.keyCheck;

  return (
    <OnboardingScreen
      footer={
        <Button size="lg" onPress={() => router.push("/apps")}>
          <Text>Next</Text>
        </Button>
      }
    >
      <IllustrationSlot height={233} className="mt-16" />
      <ResultIntro title="Your key works">
        Reached {model} in {formatLatency(latencyMs)}. It&apos;s saved encrypted on this phone.
      </ResultIntro>
    </OnboardingScreen>
  );
}
