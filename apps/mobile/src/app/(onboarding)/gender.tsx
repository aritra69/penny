import { useRouter } from "expo-router";
import { View } from "react-native";

import { FigureChoice } from "@/components/onboarding/figure-choice";
import { OnboardingScreen, StepIntro } from "@/components/onboarding/onboarding-screen";
import type { Gender } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { Button, Text } from "@repo/design-system";

/** Both figures in one picture: the woman on the left, the man on the right. */
const FIGURES = require("@/assets/illustrations/gender-figures.png");

const CHOICES: { value: Gender; label: string; side: "left" | "right" }[] = [
  { value: "female", label: "Female", side: "left" },
  { value: "male", label: "Male", side: "right" },
];

export default function GenderScreen() {
  const { back } = useOnboardingStep("gender", "privacy");
  const router = useRouter();
  const { state, update } = useOnboarding();

  return (
    <OnboardingScreen
      leading="back"
      onLeadingPress={back}
      footer={
        <Button size="lg" disabled={!state.gender} onPress={() => router.push("/steps")}>
          <Text>Next</Text>
        </Button>
      }
    >
      <StepIntro title="Which one are you?">
        Saved on this phone with the rest of your setup.
      </StepIntro>

      <View role="radiogroup" aria-label="Gender" className="flex-row gap-3 px-gutter pt-7">
        {CHOICES.map((choice) => (
          <FigureChoice
            key={choice.value}
            label={choice.label}
            image={FIGURES}
            side={choice.side}
            selected={state.gender === choice.value}
            onSelect={() => update({ gender: choice.value })}
          />
        ))}
      </View>
    </OnboardingScreen>
  );
}
