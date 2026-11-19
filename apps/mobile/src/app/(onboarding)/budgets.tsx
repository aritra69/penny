import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { OnboardingScreen, StepIntro } from "@/components/onboarding/onboarding-screen";
import { device, type BudgetSuggestions } from "@/lib/device";
import {
  canDecrease,
  monthlyTotal,
  nudge,
  startingAmounts,
  type BudgetAmounts,
} from "@/lib/onboarding/budgets";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { Button, formatMoney, Stepper, Text } from "@repo/design-system";

export default function BudgetsScreen() {
  const { back } = useOnboardingStep("budgets", "import");
  const router = useRouter();
  const { state, update } = useOnboarding();
  const [suggestions, setSuggestions] = useState<BudgetSuggestions | null>(null);
  const [edits, setEdits] = useState<BudgetAmounts>({});

  useEffect(() => {
    let mounted = true;
    device.suggestBudgets().then((found) => {
      if (mounted) setSuggestions(found);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const saved = state.budgets?.status === "set" ? state.budgets.amounts : {};
  const amounts = suggestions ? startingAmounts(suggestions, { ...saved, ...edits }) : {};
  const money = (minor: number) => formatMoney(minor, suggestions?.currency ?? "INR");

  function change(id: string, direction: -1 | 1) {
    if (!suggestions) return;
    setEdits((e) => ({ ...e, [id]: nudge(amounts[id] ?? 0, direction, suggestions.step) }));
  }

  function useThese() {
    if (!suggestions) return;
    update({ budgets: { status: "set", currency: suggestions.currency, amounts } });
    router.push("/done");
  }

  function later() {
    update({ budgets: { status: "later" } });
    router.push("/done");
  }

  return (
    <OnboardingScreen
      leading="back"
      onLeadingPress={back}
      footer={
        <>
          <Button size="lg" disabled={!suggestions} onPress={useThese}>
            <Text>Use these budgets</Text>
          </Button>
          <Button variant="link" onPress={later}>
            <Text>Set them later</Text>
          </Button>
        </>
      }
    >
      <StepIntro title="Start with these budgets?">
        Your 6-month averages, rounded up a little. Change any of them.
      </StepIntro>

      {suggestions ? (
        <View className="px-gutter pt-6">
          <View className="border-t border-foreground">
            {suggestions.categories.map((category) => {
              const amount = amounts[category.id] ?? category.suggested;
              return (
                <View
                  key={category.id}
                  className="min-h-16 flex-row items-center gap-2.5 border-b border-foreground py-2"
                >
                  <View className="flex-1 gap-0.5">
                    <Text className="font-sans-bold text-body-lg">{category.name}</Text>
                    <Text variant="caption">average {money(category.average)}</Text>
                  </View>
                  <Stepper
                    value={money(amount)}
                    decreaseLabel={`Less for ${category.name}`}
                    increaseLabel={`More for ${category.name}`}
                    onDecrease={() => change(category.id, -1)}
                    onIncrease={() => change(category.id, 1)}
                    canDecrease={canDecrease(amount, suggestions.step)}
                  />
                </View>
              );
            })}
          </View>
          <Text className="pt-4 text-label">
            <Text className="font-sans-bold text-label">
              {money(monthlyTotal(suggestions, amounts))} a month
            </Text>{" "}
            with {money(suggestions.bills)} of bills from {suggestions.autopayCount} autopays and{" "}
            {money(suggestions.everythingElse)} for everything else.
          </Text>
        </View>
      ) : null}
    </OnboardingScreen>
  );
}
