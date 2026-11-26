import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";

import { IllustrationSlot, OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { stepCounter } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { usePlanActions } from "@/lib/plan-actions";
import { dailyPrice, planPrice } from "@/lib/plans";
import {
  formatDay,
  REMINDER_DAYS_BEFORE_END,
  reminderDate,
  TRIAL_DAYS,
  trialDates,
} from "@/lib/trial";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, cn, colors, Icon, Text, Timeline } from "@repo/design-system";

const HEADLINE = "font-display text-[32px] leading-[37px] tracking-[-0.6px]";

/**
 * Step 1: the free-month paywall. Penny Plus is a free month, then ₹149 a month through Google
 * Play. The way out is the own-key plan (₹999 once), or restoring an earlier purchase.
 */
export default function PlanScreen() {
  const { back } = useOnboardingStep("plan", "steps");
  const navigation = useAppNavigation();
  const { state, update } = useOnboarding();
  const { buy, restore, busy, error } = usePlanActions();

  // The month this button would start, or the one already started.
  const trial = useMemo(
    () =>
      state.trialStartedAt && state.trialEndsAt
        ? { startedAt: state.trialStartedAt, endsAt: state.trialEndsAt }
        : trialDates(new Date()),
    [state.trialStartedAt, state.trialEndsAt],
  );
  const price = planPrice("subscription");

  async function start() {
    if (await buy("subscription")) navigation.push("plan-started");
  }

  function ownKey() {
    update({ plan: "own-key" });
    navigation.push("plan-own-key");
  }

  // Restoring skips straight to step 2; the own key still needs its key first.
  async function restorePurchase() {
    const found = await restore();
    if (found === "subscription") navigation.push("apps");
    if (found === "own-key") navigation.push(state.keyCheck ? "apps" : "key");
  }

  return (
    <OnboardingScreen
      leading="back"
      onLeadingPress={back}
      counter={stepCounter("plan")}
      footer={
        <View className="gap-3">
          {error ? (
            <Text role="alert" variant="caption" className="text-center text-destructive">
              {error}
            </Text>
          ) : null}
          <Text className="text-center font-sans-semibold text-label">
            {TRIAL_DAYS} days free, then {price}
          </Text>
          <Button size="lg" className="min-h-[58px]" disabled={busy} onPress={start}>
            {busy ? <ActivityIndicator size="small" color={colors.paper} /> : null}
            <Text className="text-headline">Start my free month</Text>
          </Button>
          <View className="flex-row items-center justify-center gap-2">
            <Icon name="check" size={16} />
            <Text className="font-sans-semibold text-caption">
              No charge today · Cancel in Google Play
            </Text>
          </View>
          <View className="mt-1.5 flex-row justify-between">
            <Button variant="link" size="sm" className="px-0" disabled={busy} onPress={ownKey}>
              <Text>Use my own key instead</Text>
            </Button>
            <Button
              variant="link"
              size="sm"
              className="px-0"
              disabled={busy}
              onPress={restorePurchase}
            >
              <Text>Restore</Text>
            </Button>
          </View>
        </View>
      }
    >
      {/* TODO: the paywall's hero picture from the design canvas, once it is in assets. */}
      <IllustrationSlot height={170} className="mt-1" />

      <View className="gap-2.5 px-gutter pt-4">
        <Text role="heading" aria-level={1} className={HEADLINE}>
          Try Penny free for a{" "}
          {/* Nested Text gets Text's own base size, so it repeats the headline's. */}
          <Text className={cn(HEADLINE, "bg-highlight")}>whole month</Text>
        </Text>
        <Text>
          Every feature, no limits. Then {price}, {dailyPrice()}.
        </Text>
      </View>

      <Timeline
        label="How your free month works"
        className="mx-gutter mt-8"
        items={[
          {
            when: `Today · ${formatDay(trial.startedAt)}`,
            title: "Everything unlocks",
            description: "Penny starts sorting your bank and UPI messages right away.",
            icon: "lock",
            tone: "done",
          },
          {
            when: `Day ${TRIAL_DAYS - REMINDER_DAYS_BEFORE_END} · ${formatDay(reminderDate(trial.endsAt))}`,
            title: "We remind you",
            description: "A notification two days before your free month ends. No surprises.",
            icon: "bell",
            tone: "next",
          },
          {
            when: `Day ${TRIAL_DAYS} · ${formatDay(trial.endsAt)}`,
            title: `${price} starts`,
            description: "Cancel any time before and you pay nothing.",
            icon: "card",
            tone: "later",
          },
        ]}
      />
    </OnboardingScreen>
  );
}
