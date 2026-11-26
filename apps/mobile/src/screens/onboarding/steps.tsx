import { View } from "react-native";

import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, StepList, Text } from "@repo/design-system";

const KEY_STEP = { title: "Connect your OpenAI key", description: "Penny sorts messages with it" };
const STEPS = [
  { title: "Pick the apps to read", description: "Banks, UPI and investments only" },
  { title: "Allow alerts and SMS", description: "Two Android switches" },
  { title: "Confirm your accounts", description: "So transfers aren't spending" },
  { title: "Import your history", description: "Budgets from real numbers" },
];

export default function SetupStepsScreen() {
  useOnboardingStep("steps");
  const navigation = useAppNavigation();
  const { state } = useOnboarding();
  // Only the own-key plan connects a key; subscribers start at picking apps.
  const ownKey = state.plan === "own-key";
  const steps = ownKey ? [KEY_STEP, ...STEPS] : STEPS;

  return (
    <OnboardingScreen
      tone="dark"
      footer={
        <Button
          variant="inverse"
          size="lg"
          onPress={() => navigation.push(ownKey ? "key" : "apps")}
        >
          <Text>Start</Text>
        </Button>
      }
    >
      <View className="gap-2.5 px-gutter pt-12">
        <Text
          role="heading"
          aria-level={1}
          className="font-display text-[32px] leading-[37px] tracking-[-0.5px] text-primary-foreground"
        >
          Set up Penny in {steps.length} steps
        </Text>
        <Text className="text-primary-foreground">
          About 3 minutes. You can stop and come back.
        </Text>
      </View>
      <StepList tone="dark" steps={steps} className="mx-gutter mt-10" />
    </OnboardingScreen>
  );
}
