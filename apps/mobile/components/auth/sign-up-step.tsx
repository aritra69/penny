import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, type TextInputInstance } from "react-native";

import { OnboardingScreen, StepIntro } from "@/components/onboarding/onboarding-screen";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, colors, Text, TextField } from "@repo/design-system";

/** How many screens creating an account with email takes: name, email, password. */
const STEPS = 3;

type SignUpStepProps = {
  /** 1-based, for the "1 / 3" counter. */
  step: number;
  title: string;
  /** One short line under the title. */
  line?: string;
  field: Omit<React.ComponentProps<typeof TextField>, "value" | "onChangeText" | "error">;
  /** The one button at the bottom. */
  action: string;
  /** What to fix in the value, or null when it's fine. */
  check: (value: string) => string | null;
  /** Runs with a checked value. Resolve to an error to show it, or nothing to move on. */
  onDone: (value: string) => Promise<string | null | void> | void;
};

/** One screen of creating an account: a question, one field and one button. */
export function SignUpStep({ step, title, line, field, action, check, onDone }: SignUpStepProps) {
  const navigation = useAppNavigation();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // Password fields get an eye button to show what was typed.
  const [shown, setShown] = useState(false);
  const secret = !!field.secureTextEntry;
  const input = useRef<TextInputInstance>(null);

  // Open the keyboard once the screen has slid in. `autoFocus` fires mid-transition, and Android
  // drops the keyboard request then, so each step after the first would open without it.
  useEffect(
    () =>
      navigation.addListener("transitionEnd", (event) => {
        if (!event.data.closing) input.current?.focus();
      }),
    [navigation],
  );

  async function submit() {
    const problem = check(value);
    setError(problem);
    if (problem) return;
    setBusy(true);
    try {
      const failed = await onDone(value);
      if (failed) setError(failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <OnboardingScreen
      leading="back"
      onLeadingPress={() => navigation.goBack()}
      counter={`${step} / ${STEPS}`}
      footer={
        <Button size="lg" disabled={busy} onPress={submit}>
          {busy ? <ActivityIndicator size="small" color={colors.paper} /> : null}
          <Text>{action}</Text>
        </Button>
      }
    >
      <StepIntro title={title}>{line}</StepIntro>
      <View className="px-gutter pt-7">
        <TextField
          {...field}
          ref={input}
          value={value}
          onChangeText={(text) => {
            setValue(text);
            setError(null);
          }}
          error={error ?? undefined}
          secureTextEntry={secret && !shown}
          action={
            secret
              ? {
                  icon: "eye",
                  label: shown ? "Hide password" : "Show password",
                  onPress: () => setShown((visible) => !visible),
                }
              : field.action
          }
          returnKeyType={step === STEPS ? "go" : "next"}
          // Keep the keyboard up between steps, so the next field opens ready to type.
          submitBehavior={step === STEPS ? "blurAndSubmit" : "submit"}
          onSubmitEditing={submit}
        />
      </View>
    </OnboardingScreen>
  );
}
