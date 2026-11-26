import { useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { IllustrationSlot, OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { stepCounter } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { usePlanActions } from "@/lib/plan-actions";
import { dailyPrice, planPrice } from "@/lib/plans";
import { formatDay, reminderDate, trialDates } from "@/lib/trial";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, cn, colors, Icon, Text } from "@repo/design-system";

const HEADLINE = "font-display text-[32px] leading-[37px] tracking-[-0.6px]";

/** What the month buys, in as few words as possible. */
const VALUE = [
  "Every payment sorted for you",
  "Bills caught before they're due",
  "Budgets that keep themselves",
];

/** The picture is cropped to its drawing (no sky), so it is wider than the 3:2 heroes. */
const HERO_ASPECT = 1086 / 462;
/** About its height at full width; a shorter screen gives it only the room the rest leaves. */
const HERO_HEIGHT = 150;
/** Below this the picture would be a sliver, so it's left out. */
const HERO_MIN_HEIGHT = 96;

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
  // The room left above the headline; the picture fits itself into it so nothing scrolls.
  const [heroSpace, setHeroSpace] = useState(0);
  const heroHeight = Math.min(HERO_HEIGHT, heroSpace);

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
          <Text className="text-center text-label">
            <Text className="font-sans-bold text-label">₹0 today</Text>, then {price} ·{" "}
            {dailyPrice()}
          </Text>
          <Button size="lg" className="min-h-[58px]" disabled={busy} onPress={start}>
            {busy ? <ActivityIndicator size="small" color={colors.paper} /> : null}
            <Text className="text-headline">Start my free month</Text>
          </Button>
          <View className="flex-row items-center justify-center gap-2">
            <Icon name="bell" size={16} />
            <Text className="font-sans-semibold text-caption">
              Reminder on {formatDay(reminderDate(trial.endsAt))} · Cancel in Google Play
            </Text>
          </View>
          <View className="flex-row justify-between">
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
      <View
        className="flex-1 justify-center pt-1"
        onLayout={(event) => setHeroSpace(Math.round(event.nativeEvent.layout.height) - 4)}
      >
        {heroHeight >= HERO_MIN_HEIGHT ? (
          <IllustrationSlot
            source={require("@/assets/illustrations/hero-free-month.png")}
            inked={false}
            aspectRatio={HERO_ASPECT}
            height={heroHeight}
          />
        ) : null}
      </View>

      <View className="gap-5 px-gutter pt-4">
        <Text role="heading" aria-level={1} className={HEADLINE}>
          Try Penny free for a{" "}
          {/* Nested Text gets Text's own base size, so it repeats the headline's. */}
          <Text className={cn(HEADLINE, "bg-highlight")}>whole month</Text>
        </Text>
        <View role="list" aria-label="What you get" className="gap-3">
          {VALUE.map((line) => (
            <View key={line} role="listitem" className="flex-row items-center gap-3">
              <Icon name="check" size={20} />
              <Text className="font-sans-semibold text-body-lg">{line}</Text>
            </View>
          ))}
        </View>
      </View>
    </OnboardingScreen>
  );
}
