import { useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { OnboardingScreen, StepIntro } from "@/components/onboarding/onboarding-screen";
import type { Plan } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { requestPayment } from "@/lib/payments";
import { PLAN_PRICES } from "@/lib/plans";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, ChoiceCard, ChoiceGroup, colors, formatMoney, Text } from "@repo/design-system";

const price = (plan: Plan) => {
  const { amount, currency, every } = PLAN_PRICES[plan];
  const money = formatMoney(amount, currency);
  return every ? `${money} a ${every}` : `${money} once`;
};

const PLANS: { value: Plan; title: string; description: string }[] = [
  {
    value: "subscription",
    title: `Subscription · ${price("subscription")}`,
    description: "Nothing to connect. Penny does the sorting for you.",
  },
  {
    value: "own-key",
    title: `Your own OpenAI key · ${price("own-key")}`,
    description: "You connect a key and pay OpenAI directly, under a paisa per message.",
  },
];

export default function PlanScreen() {
  const { back } = useOnboardingStep("plan", "gender");
  const navigation = useAppNavigation();
  const { state, update } = useOnboarding();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = state.plan;
  const paid = !!plan && state.paidPlan === plan;

  function choose(value: Plan) {
    setError(null);
    update({ plan: value });
  }

  async function next() {
    if (!plan) return;
    if (!paid) {
      setPaying(true);
      setError(null);
      const result = await requestPayment(plan, price(plan)).finally(() => setPaying(false));
      if (result === "cancelled") return;
      if (result === "failed") {
        setError("The payment didn't go through. Try again, or pick the other plan.");
        return;
      }
      update({ paidPlan: plan });
    }
    navigation.push("steps");
  }

  const action = !plan
    ? "Next"
    : paid
      ? "Next"
      : plan === "subscription"
        ? "Subscribe"
        : `Pay ${formatMoney(PLAN_PRICES[plan].amount, PLAN_PRICES[plan].currency)}`;

  return (
    <OnboardingScreen
      leading="back"
      onLeadingPress={back}
      footer={
        <>
          {error ? (
            <Text role="alert" variant="caption" className="pb-2 text-destructive">
              {error}
            </Text>
          ) : null}
          <Button size="lg" disabled={!plan || paying} onPress={next}>
            {paying ? <ActivityIndicator size="small" color={colors.mutedText} /> : null}
            <Text>{action}</Text>
          </Button>
        </>
      }
    >
      <StepIntro title="How do you want to pay?">
        Penny sorts each message with OpenAI. Pick who pays OpenAI for that.
      </StepIntro>

      <View className="gap-4 px-gutter pt-7">
        <ChoiceGroup label="Plan">
          {PLANS.map((option) => (
            <ChoiceCard
              key={option.value}
              variant="row"
              title={option.title}
              description={option.description}
              selected={plan === option.value}
              onSelect={() => choose(option.value)}
            />
          ))}
        </ChoiceGroup>
        <Text variant="caption">
          {paid
            ? "Paid. You can go on with setup."
            : "You won't be charged. Payment isn't set up in this version, so you choose whether it goes through."}
        </Text>
      </View>
    </OnboardingScreen>
  );
}
