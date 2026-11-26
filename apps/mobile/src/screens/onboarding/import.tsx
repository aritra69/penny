import { useEffect, useState } from "react";
import { View } from "react-native";

import { OnboardingScreen, StepIntro } from "@/components/onboarding/onboarding-screen";
import { device, type ImportProgress } from "@/lib/device";
import { stepCounter } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, ProgressBar, Text } from "@repo/design-system";

const MONTHS = 6;

const month = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" });

const count = (n: number) => n.toLocaleString("en-IN");

export default function ImportScreen() {
  const { back } = useOnboardingStep("import", "accounts");
  const navigation = useAppNavigation();
  const { state, update } = useOnboarding();
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  // Reading starts when the screen opens and is left running when the user moves on.
  useEffect(() => {
    const run = device.importHistory(MONTHS, setProgress);
    return () => run.cancel();
  }, []);

  function keepReading() {
    update({ importChoice: "background" });
    navigation.push("budgets");
  }

  function skip() {
    update({ importChoice: "skipped" });
    navigation.push("done");
  }

  return (
    <OnboardingScreen
      leading="back"
      onLeadingPress={back}
      counter={stepCounter("import", state.plan)}
      footer={
        <>
          <Button size="lg" onPress={keepReading}>
            <Text>{progress?.done ? "Next" : "Keep reading in the background"}</Text>
          </Button>
          <Button variant="link" onPress={skip}>
            <Text>Skip, start from today</Text>
          </Button>
        </>
      }
    >
      <StepIntro title="Read your last 6 months?">
        Penny sorts your old bank SMS so budgets start from real numbers.
      </StepIntro>

      {progress ? (
        <View className="gap-3.5 px-gutter pt-12">
          <View className="flex-row items-baseline justify-between">
            <Text className="font-sans-bold">
              {progress.done ? "Read" : "Reading"} {month(progress.from)} to {month(progress.to)}
            </Text>
            <Text className="font-sans-bold">{Math.round(progress.fraction * 100)}%</Text>
          </View>
          <ProgressBar label="Import progress" value={progress.fraction} />
          <Text className="pt-[18px] font-display text-[30px] leading-9">
            {count(progress.messagesRead)} messages
          </Text>
          <Text>
            {count(progress.transactionsFound)} transactions found{"\n"}
            {count(progress.codesDropped)} one-time codes dropped on the phone
          </Text>
        </View>
      ) : null}
    </OnboardingScreen>
  );
}
