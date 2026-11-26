import { useEffect } from "react";
import { View } from "react-native";

import { IllustrationSlot, OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { FactList, NotificationPreview } from "@/components/plan/plan-parts";
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
      {/* TODO: the "free month started" picture from the design canvas, once it is in assets. */}
      <IllustrationSlot height={200} className="mt-14" />

      <View className="gap-2.5 px-gutter pt-7">
        <Text variant="title" className="leading-[34px]">
          Your free month has started
        </Text>
        <Text>
          Everything is unlocked until {formatDay(endsAt)}. Here&apos;s the reminder you&apos;ll get
          two days before it ends:
        </Text>
      </View>

      <NotificationPreview
        className="mx-gutter mt-6"
        when={formatDay(reminderDate(endsAt))}
        title="Your free month ends in 2 days"
        body={`Plus starts on ${formatDay(endsAt)} at ${price}. Tap to keep it or cancel.`}
      />

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
