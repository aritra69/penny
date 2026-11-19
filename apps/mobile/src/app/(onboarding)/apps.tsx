import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { OnboardingScreen, StepIntro } from "@/components/onboarding/onboarding-screen";
import { device, type DetectedApp } from "@/lib/device";
import { stepCounter, toggleId } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { Button, SelectRow, Text } from "@repo/design-system";

/** Bank SMS is a source like the apps, but it isn't an app, so it has its own id. */
const SMS_SOURCE = "sms";

export default function AppsScreen() {
  const router = useRouter();
  const { state, update } = useOnboarding();
  // Subscribers come straight from the setup steps; there is no key screen behind them.
  const { back } = useOnboardingStep("apps", state.plan === "own-key" ? "key-ok" : "steps");
  const [apps, setApps] = useState<DetectedApp[] | null>(null);

  useEffect(() => {
    let mounted = true;
    device.detectApps().then((found) => {
      if (mounted) setApps(found);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Until the user changes something, Penny's suggestions are picked.
  const picked = state.sources ?? [
    ...(apps ?? []).filter((app) => app.suggested).map((app) => app.id),
    SMS_SOURCE,
  ];
  const toggle = (id: string) => (selected: boolean) =>
    update({ sources: toggleId(picked, id, selected) });

  function next() {
    update({ sources: picked });
    router.push("/permissions");
  }

  return (
    <OnboardingScreen
      leading="back"
      onLeadingPress={back}
      counter={stepCounter("apps", state.plan)}
      footer={
        <Button size="lg" disabled={!apps} onPress={next}>
          <Text>Next</Text>
        </Button>
      }
    >
      <StepIntro title="Which apps can Penny read?">
        Only alerts from these are read. Everything else is ignored on the phone.
      </StepIntro>

      {apps ? (
        <View role="group" aria-label="Apps found on this phone" className="px-gutter pt-7">
          {apps.map((app) => (
            <SelectRow
              key={app.id}
              title={app.name}
              subtitle={app.note}
              selected={picked.includes(app.id)}
              onSelectedChange={toggle(app.id)}
            />
          ))}
          <SelectRow
            title="Bank SMS"
            subtitle="Only from bank senders like HDFCBK"
            selected={picked.includes(SMS_SOURCE)}
            onSelectedChange={toggle(SMS_SOURCE)}
          />
        </View>
      ) : null}

      <View className="gap-2 px-gutter pt-7">
        <Text className="font-sans-bold text-caption">Never read</Text>
        <Text>WhatsApp, Gmail, chats, personal SMS, and any message with a one-time code.</Text>
      </View>
    </OnboardingScreen>
  );
}
