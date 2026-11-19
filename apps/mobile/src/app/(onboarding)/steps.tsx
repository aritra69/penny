import { useRouter } from "expo-router";
import { View } from "react-native";

import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { Button, StepList, Text } from "@repo/design-system";

const STEPS = [
  { title: "Connect your OpenAI key", description: "Penny sorts messages with it" },
  { title: "Pick the apps to read", description: "Banks, UPI and investments only" },
  { title: "Allow alerts and SMS", description: "Two Android switches" },
  { title: "Confirm your accounts", description: "So transfers aren't spending" },
  { title: "Import your history", description: "Budgets from real numbers" },
];

export default function SetupStepsScreen() {
  useOnboardingStep("steps");
  const router = useRouter();

  return (
    <OnboardingScreen
      tone="dark"
      footer={
        <Button variant="inverse" size="lg" onPress={() => router.push("/key")}>
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
          Set up Penny in 5 steps
        </Text>
        <Text className="text-primary-foreground">
          About 3 minutes. You can stop and come back.
        </Text>
      </View>
      <StepList tone="dark" steps={STEPS} className="mx-gutter mt-10" />
    </OnboardingScreen>
  );
}
