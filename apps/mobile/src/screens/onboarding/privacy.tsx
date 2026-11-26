import { useState } from "react";
import { Pressable, View } from "react-native";

import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { authClient } from "@/lib/auth/client";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, CheckboxBox, Text } from "@repo/design-system";

function Point({ children }: { children: React.ReactNode }) {
  return (
    <View role="listitem" className="flex-row gap-3.5">
      <View aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-foreground" />
      <Text className="flex-1">{children}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  useOnboardingStep("privacy");
  const navigation = useAppNavigation();
  const { state, update } = useOnboarding();
  const [agreed, setAgreed] = useState(!!state.privacyAgreedAt);
  const [leaving, setLeaving] = useState(false);

  // Closing goes back to Welcome, which means signing out. Progress stays saved for this account.
  async function close() {
    setLeaving(true);
    await authClient.signOut().finally(() => setLeaving(false));
  }

  function agree() {
    update({ privacyAgreedAt: state.privacyAgreedAt ?? new Date().toISOString() });
    navigation.push("gender");
  }

  return (
    <OnboardingScreen
      leading="close"
      onLeadingPress={leaving ? undefined : close}
      footer={
        <Button size="lg" disabled={!agreed} onPress={agree}>
          <Text>Agree and continue</Text>
        </Button>
      }
    >
      <View className="px-gutter pt-4">
        <Text role="heading" aria-level={1} className="font-display text-[26px] leading-8">
          How Penny treats your money data
        </Text>
      </View>

      <View role="list" className="gap-5 pl-[22px] pr-gutter pt-7">
        <Point>
          <Text className="bg-highlight font-sans-bold">Stored encrypted</Text> on Penny&apos;s
          servers.
        </Point>
        <Point>Only the apps you pick are read.</Point>
        <Point>One-time codes are dropped on the phone.</Point>
        <Point>
          Only a message&apos;s text goes to OpenAI,{" "}
          <Text className="font-sans-bold">nothing else</Text>.
        </Point>
        <Point>Read-only. Penny can never move money.</Point>
      </View>

      <Pressable
        role="checkbox"
        aria-checked={agreed}
        onPress={() => setAgreed((a) => !a)}
        className="mx-gutter mt-8 min-h-touch flex-row items-center gap-3.5"
      >
        <CheckboxBox checked={agreed} />
        <Text variant="strong" className="flex-1">
          I&apos;ve read this and the <Text className="font-sans-semibold underline">terms</Text>
        </Text>
      </Pressable>
    </OnboardingScreen>
  );
}
