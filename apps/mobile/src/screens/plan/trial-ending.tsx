import { useEffect } from "react";
import { View } from "react-native";

import { FactList, SectionLabel } from "@/components/plan/plan-parts";
import { PlanScreen } from "@/components/plan/plan-screen";
import { useOnboarding } from "@/lib/onboarding/store";
import { openPlaySubscriptions } from "@/lib/payments";
import { PLAN_NAMES, planPrice } from "@/lib/plans";
import { daysLeft, formatDay, formatDays, formatWeekdayDay } from "@/lib/trial";
import { useTrialStats } from "@/lib/use-trial-stats";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, cn, formatMoney, IconButton, Mark, Text } from "@repo/design-system";

/**
 * Day 28: the free month is about to end. Opened by the reminder notification (see
 * `lib/trial-reminder.ts`). Shows what Penny did this month and what happens next, with the
 * three ways on: keep Plus, switch to the own key, or cancel in Google Play.
 */
export default function TrialEndingScreen() {
  const navigation = useAppNavigation();
  const { state } = useOnboarding();
  const trialing = state.plan === "subscription" && !!state.trialEndsAt;
  const endsAt = trialing ? state.trialEndsAt : null;
  const stats = useTrialStats(trialing ? state.trialStartedAt : null);

  // Nothing to end without a free month running (the plan changed, or it was restored).
  useEffect(() => {
    if (!endsAt) navigation.goBack();
  }, [navigation, endsAt]);

  if (!endsAt) return null;
  const left = daysLeft(endsAt, new Date());
  const price = planPrice("subscription");
  const close = () => navigation.goBack();

  return (
    <PlanScreen
      header={
        <View className="min-h-touch flex-row items-center justify-between pl-gutter pr-3 pt-6">
          <Mark>
            {left > 0
              ? `${formatDays(left)} left in your free month`
              : "Your free month ends today"}
          </Mark>
          <IconButton icon="close" label="Close" onPress={close} />
        </View>
      }
      footer={
        <>
          {/* Nothing to do: Plus carries on when the month ends. */}
          <Button size="lg" className="min-h-[58px]" onPress={close}>
            <Text className="text-headline">Keep {PLAN_NAMES.subscription}</Text>
          </Button>
          <Button
            variant="outline"
            className="min-h-[52px]"
            onPress={() => navigation.push("plan-own-key")}
          >
            <Text>Switch to my own key · {planPrice("own-key")}</Text>
          </Button>
          <Button
            variant="link"
            size="sm"
            className="self-center px-0"
            onPress={openPlaySubscriptions}
          >
            <Text>Cancel in Google Play</Text>
          </Button>
        </>
      }
    >
      <Text
        role="heading"
        aria-level={1}
        className="mx-gutter mt-5 font-display text-[30px] leading-[35px] tracking-[-0.6px]"
      >
        Here&apos;s your first month with Penny
      </Text>

      {stats ? (
        <View aria-label="Your month so far" className="mx-gutter mt-6 flex-row gap-2.5">
          <Tile figure={String(stats.sorted)} label="messages sorted for you" filled />
          <Tile
            figure={formatMoney(stats.spent.amount, stats.spent.currency)}
            label="spending tracked"
          />
          {/* TODO: "bills caught" and "goals on track" boxes, once Bills and Goals exist. */}
        </View>
      ) : null}

      <View className="mx-gutter mt-7 gap-2.5">
        <SectionLabel>What happens next</SectionLabel>
        <FactList
          facts={[
            { label: formatWeekdayDay(endsAt), value: "Plus starts" },
            { label: "Price", value: price },
          ]}
        />
        <Text variant="caption" className="mt-1">
          Cancel before {formatDay(endsAt)} and you won&apos;t be charged. Your history stays stored
          encrypted if you come back.
        </Text>
      </View>
    </PlanScreen>
  );
}

function Tile({ figure, label, filled }: { figure: string; label: string; filled?: boolean }) {
  return (
    <View
      className={cn(
        "flex-1 gap-1 p-4",
        filled ? "bg-primary" : "border-1.5 border-foreground bg-background",
      )}
    >
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        className={cn("font-display text-[30px] leading-9", filled && "text-primary-foreground")}
      >
        {figure}
      </Text>
      <Text variant="caption" className={cn("leading-[18px]", filled && "text-primary-foreground")}>
        {label}
      </Text>
    </View>
  );
}
