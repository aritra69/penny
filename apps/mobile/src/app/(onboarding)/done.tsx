import {
  IllustrationSlot,
  OnboardingScreen,
  ResultIntro,
} from "@/components/onboarding/onboarding-screen";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { Button, Text } from "@repo/design-system";

export default function AllSetScreen() {
  useOnboardingStep("done");
  const { complete } = useOnboarding();

  return (
    <OnboardingScreen
      footer={
        // Finishing flips the root layout's guard, which shows Home.
        <Button size="lg" onPress={complete}>
          <Text>Go to Home</Text>
        </Button>
      }
    >
      <IllustrationSlot height={233} className="mt-16" />
      <ResultIntro title="You're all set">
        New payments sort themselves as they arrive. Your budgets are ready to check, and you can
        change anything in Settings.
      </ResultIntro>
    </OnboardingScreen>
  );
}
