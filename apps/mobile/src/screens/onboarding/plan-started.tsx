import { useEffect } from "react";
import { View } from "react-native";

import { IllustrationSlot, OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { FactList } from "@/components/plan/plan-parts";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { planPrice } from "@/lib/plans";
import { formatDay, formatFullDate, reminderDate } from "@/lib/trial";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, Text } from "@repo/design-system";

/** After starting Penny Plus: when the free month ends, and the one reminder before it does. */
export default function FreeMonthStartedScreen() {
  useOnboardingStep("plan-started");
  const navigation = useAppNavigation();
  const { state } = useOnboarding();
  const endsAt = state.trialEndsAt;

  // Only reached by starting the free month; without its dates there is nothing to show.
  useEffect(() => {
    if (!endsAt) navigation.replace("apps");
  }, [navigation, endsAt]);

  if (!endsAt) return null;
  const price = planPrice("subscription");

  return (
    <OnboardingScreen
      footer={
        <Button size="lg" onPress={() => navigation.push("apps")}>
          <Text>Next</Text>
        </Button>
      }
    >
      <IllustrationSlot
        source={require("@/assets/illustrations/hero-trial-reminder.png")}
        inked={false}
        anchor="center"
        height={200}
        className="mt-8"
      />

      <View className="gap-2.5 px-gutter pt-7">
        <Text variant="title" className="leading-[34px]">
          Your free month has started
        </Text>
        <Text>We&apos;ll remind you on {formatDay(reminderDate(endsAt))}, before it ends.</Text>
      </View>

      <FactList
        className="mx-gutter mt-7"
        facts={[
          { label: "Free until", value: formatFullDate(endsAt) },
          { label: "Then", value: price },
          { label: "Billed by", value: "Google Play" },
        ]}
      />
    </OnboardingScreen>
  );
}
