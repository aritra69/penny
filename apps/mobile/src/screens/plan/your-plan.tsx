import { Pressable, View } from "react-native";

import { SectionLabel } from "@/components/plan/plan-parts";
import { PlanScreen } from "@/components/plan/plan-screen";
import { useOnboarding } from "@/lib/onboarding/store";
import { openPlaySubscriptions } from "@/lib/payments";
import { usePlanActions } from "@/lib/plan-actions";
import { PLAN_NAMES, planPrice } from "@/lib/plans";
import { formatDay, formatFullDate, reminderDate } from "@/lib/trial";
import { useTrialStats } from "@/lib/use-trial-stats";
import { useAppNavigation } from "@/src/navigation/types";
import {
  Button,
  cn,
  colors,
  Icon,
  type IconName,
  Mark,
  ScreenHeader,
  Text,
} from "@repo/design-system";

/** Settings › Your plan: what the user is on, switching to the own key, and billing in Play. */
export default function YourPlanScreen() {
  const navigation = useAppNavigation();
  const { state } = useOnboarding();
  const { restore, busy, error } = usePlanActions();
  const plan = state.paidPlan;
  // The free month runs to its end even after switching to the own key.
  const trialEndsAt =
    state.trialEndsAt && Date.parse(state.trialEndsAt) > Date.now() ? state.trialEndsAt : null;
  const onPlus = plan === "subscription";
  const stats = useTrialStats(trialEndsAt && onPlus ? state.trialStartedAt : null);
  const plusPrice = planPrice("subscription");

  const summary = !plan
    ? "No plan yet. Restore a purchase made on this Google account."
    : onPlus
      ? trialEndsAt
        ? `Free until ${formatFullDate(trialEndsAt)}, then ${plusPrice}`
        : `${plusPrice}, billed by Google Play`
      : trialEndsAt
        ? `Paid once. Your free month runs until ${formatFullDate(trialEndsAt)}, then Penny uses your key.`
        : `Paid once, ${planPrice("own-key")}. Penny sorts with your OpenAI key.`;

  const reminder =
    onPlus && trialEndsAt
      ? [
          `We'll remind you on ${formatDay(reminderDate(trialEndsAt))}`,
          stats ? `${stats.sorted} messages sorted so far` : null,
        ]
          .filter(Boolean)
          .join(" · ")
      : null;

  const footnote = onPlus
    ? trialEndsAt
      ? `Cancel before ${formatDay(trialEndsAt)} and you won't be charged. Everything stays unlocked until then, and your history stays stored encrypted.`
      : "Cancel any time in Google Play. Your history stays stored encrypted."
    : "Your history stays stored encrypted.";

  return (
    <PlanScreen
      header={
        <ScreenHeader leading="back" onLeadingPress={() => navigation.goBack()} title="Settings" />
      }
    >
      <Text variant="title" className="mx-gutter mt-4">
        Your plan
      </Text>

      <View className="mx-gutter mt-6 gap-2 bg-primary p-5">
        <View className="flex-row items-center gap-2.5">
          <Text className="flex-1 font-display text-[20px] leading-6 text-primary-foreground">
            {plan ? PLAN_NAMES[plan] : "No plan"}
          </Text>
          {onPlus && trialEndsAt ? <Mark size="sm">Free trial</Mark> : null}
        </View>
        <Text className="text-primary-foreground">{summary}</Text>
        {reminder ? (
          <View className="mt-2.5 border-t border-muted-foreground pt-3">
            <Text className="text-label text-primary-foreground">{reminder}</Text>
          </View>
        ) : null}
      </View>

      {onPlus ? (
        <View className="mx-gutter mt-7 gap-3">
          <SectionLabel>Switch plan</SectionLabel>
          <View className="gap-2.5 border-1.5 border-foreground p-[18px]">
            <View className="flex-row items-baseline justify-between gap-3">
              <Text className="font-display text-headline">{PLAN_NAMES["own-key"]}</Text>
              <Text className="font-sans-bold">{planPrice("own-key")}</Text>
            </View>
            <Text className="text-label">
              {trialEndsAt
                ? `Your free month keeps running until ${formatDay(trialEndsAt)}. After that Penny uses your key and Plus never charges you.`
                : "Penny uses your key from then on, and Plus stops charging you."}
            </Text>
            <Button
              variant="outline"
              className="mt-1"
              onPress={() => navigation.push("plan-own-key")}
            >
              <Text>Switch to my own key</Text>
            </Button>
          </View>
        </View>
      ) : null}

      <View
        role="list"
        aria-label="Billing"
        className="mx-gutter mt-7 border-t-1.5 border-foreground"
      >
        {onPlus || trialEndsAt ? (
          <BillingRow
            label="Manage in Google Play"
            icon="external"
            onPress={openPlaySubscriptions}
          />
        ) : null}
        <BillingRow label="Restore purchase" disabled={busy} onPress={restore} />
        {onPlus ? (
          <BillingRow
            label={trialEndsAt ? "Cancel free trial" : `Cancel ${PLAN_NAMES.subscription}`}
            onPress={openPlaySubscriptions}
            destructive
          />
        ) : null}
      </View>
      {error ? (
        <Text role="alert" variant="caption" className="mx-gutter mt-3 text-destructive">
          {error}
        </Text>
      ) : null}

      <Text variant="caption" className="mx-gutter mt-4">
        {footnote}
      </Text>
    </PlanScreen>
  );
}

function BillingRow({
  label,
  icon = "chevron-right",
  destructive,
  disabled,
  onPress,
}: {
  label: string;
  icon?: IconName;
  destructive?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      role="button"
      disabled={disabled}
      onPress={onPress}
      className="min-h-[52px] flex-row items-center justify-between border-b border-line-muted active:bg-muted"
    >
      <Text className={cn("font-sans-semibold", destructive && "text-destructive")}>{label}</Text>
      <Icon
        name={icon}
        size={18}
        strokeWidth={1.5}
        color={destructive ? colors.destructive : colors.ink}
      />
    </Pressable>
  );
}
