import { View } from "react-native";

import {
  IllustrationSlot,
  OnboardingScreen,
  ResultIntro,
} from "@/components/onboarding/onboarding-screen";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { planPrice } from "@/lib/plans";
import { formatDay, reminderDate } from "@/lib/trial";
import { Button, Icon, Text } from "@repo/design-system";

export default function AllSetScreen() {
  useOnboardingStep("done");
  const { state, complete } = useOnboarding();
  // The free-month note is for the trial path only (not the own key, not a restored purchase).
  const trialEndsAt = state.plan === "subscription" ? state.trialEndsAt : null;

  return (
    <OnboardingScreen
      footer={
        // Finishing flips the root layout's guard, which shows Home.
        <Button size="lg" onPress={complete}>
          <Text>Go to Home</Text>
        </Button>
      }
    >
      <IllustrationSlot
        source={require("@/assets/illustrations/hero-done.png")}
        height={233}
        className="mt-16"
      />
      <ResultIntro title="You're all set">
        New payments sort themselves as they arrive. Your budgets are ready to check, and you can
        change anything in Settings.
      </ResultIntro>
      {trialEndsAt ? (
        <View className="mx-gutter mt-7 flex-row items-start gap-3 border-1.5 border-foreground px-4 py-3.5">
          <Icon name="bell" size={20} strokeWidth={1.75} />
          <Text className="flex-1 text-label">
            <Text className="font-sans-bold text-label">Free until {formatDay(trialEndsAt)}.</Text>{" "}
            We&apos;ll remind you on {formatDay(reminderDate(trialEndsAt))}, two days before{" "}
            {planPrice("subscription")} starts.
          </Text>
        </View>
      ) : null}
    </OnboardingScreen>
  );
}
