import { ActivityIndicator, Linking, View } from "react-native";

import { OnboardingScreen, StepIntro } from "@/components/onboarding/onboarding-screen";
import { FactList, SectionLabel } from "@/components/plan/plan-parts";
import { stepCounter } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { usePlanActions } from "@/lib/plan-actions";
import { planAmount, planPrice } from "@/lib/plans";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, colors, Text } from "@repo/design-system";

const KEYS_HELP_URL = "https://platform.openai.com/api-keys";

/**
 * The own-key plan: ₹999 once through Google Play, then the user's OpenAI key does the sorting.
 * Reached from the paywall during setup, and from Settings › Your plan to switch plans.
 */
export default function PayOnceScreen() {
  const { back } = useOnboardingStep("plan-own-key", "plan");
  const navigation = useAppNavigation();
  const { state, update } = useOnboarding();
  const { buy, restore, busy, error } = usePlanActions();
  // From Settings, after setup: no step number, and the paywall isn't behind this screen.
  const settings = state.completed;
  const paid = state.paidPlan === "own-key";

  async function pay() {
    if (await buy("own-key")) navigation.push("key");
  }

  async function restorePurchase() {
    const found = await restore();
    if (found === "own-key") navigation.push(state.keyCheck ? "key-ok" : "key");
    else if (found === "subscription" && !settings) navigation.push("apps");
  }

  function subscribe() {
    if (!settings) update({ plan: "subscription" });
    back();
  }

  return (
    <OnboardingScreen
      leading="back"
      onLeadingPress={back}
      counter={settings ? undefined : stepCounter("plan-own-key")}
      footer={
        <View className="gap-3.5">
          {error ? (
            <Text role="alert" variant="caption" className="text-destructive">
              {error}
            </Text>
          ) : null}
          <Button size="lg" disabled={busy} onPress={pay}>
            {busy ? <ActivityIndicator size="small" color={colors.paper} /> : null}
            <Text>{paid ? "Next" : `Pay ${planPrice("own-key")}`}</Text>
          </Button>
          <View className="flex-row justify-between">
            <Button variant="link" size="sm" className="px-0" disabled={busy} onPress={subscribe}>
              <Text>{settings ? "Keep Penny Plus" : "Subscribe instead"}</Text>
            </Button>
            {paid ? null : (
              <Button
                variant="link"
                size="sm"
                className="px-0"
                disabled={busy}
                onPress={restorePurchase}
              >
                <Text>Already bought it?</Text>
              </Button>
            )}
          </View>
        </View>
      }
    >
      <StepIntro title="Pay once, bring your own key">
        One payment unlocks Penny for good. Messages are sorted with your OpenAI key, so OpenAI
        bills you directly.
      </StepIntro>

      <View className="mx-gutter mt-8 gap-3.5">
        <SectionLabel>What it costs</SectionLabel>
        <FactList
          facts={[
            { label: "Penny, once", value: planAmount("own-key"), figure: true },
            { label: "OpenAI, per message", value: "under a paisa" },
          ]}
        />
      </View>

      <View className="mx-gutter mt-7 gap-3">
        <SectionLabel>You&apos;ll need</SectionLabel>
        <View role="list" className="gap-2">
          <Text role="listitem">1. An OpenAI account with billing turned on</Text>
          <Text role="listitem">
            2. An API key that starts with <Text className="font-sans-bold">sk-</Text>
          </Text>
        </View>
        <Button
          variant="link"
          size="sm"
          className="self-start px-0"
          onPress={() => Linking.openURL(KEYS_HELP_URL)}
        >
          <Text>How do I make a key?</Text>
        </Button>
      </View>
    </OnboardingScreen>
  );
}
