import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { OnboardingScreen, StepIntro } from "@/components/onboarding/onboarding-screen";
import {
  AllowSmsSketch,
  AppInfoMenuSketch,
  RestrictedSettingsSketch,
} from "@/components/onboarding/phone-sketches";
import { device, type DevicePermissions } from "@/lib/device";
import { stepCounter } from "@/lib/onboarding/state";
import { useOnboarding } from "@/lib/onboarding/store";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { Button, StatusRow, Text } from "@repo/design-system";

function UnlockStep({
  number,
  children,
  sketch,
}: {
  number: number;
  children: string;
  sketch: React.ReactNode;
}) {
  return (
    <View className="flex-1 gap-2">
      {sketch}
      <Text variant="small">
        <Text className="font-sans-bold text-small">{number}</Text> {children}
      </Text>
    </View>
  );
}

export default function PermissionsScreen() {
  const { back } = useOnboardingStep("permissions", "apps");
  const router = useRouter();
  const { state } = useOnboarding();
  const [permissions, setPermissions] = useState<DevicePermissions | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    device.getPermissions().then((current) => {
      if (mounted) setPermissions(current);
    });
    return () => {
      mounted = false;
    };
  }, []);

  /** Each request resolves with the permissions as they are when the user is back in Penny. */
  const ask = (request: () => Promise<DevicePermissions>) => async () => {
    setBusy(true);
    try {
      setPermissions(await request());
    } finally {
      setBusy(false);
    }
  };

  const smsAllowed = permissions?.sms === "allowed";

  return (
    <OnboardingScreen
      leading="back"
      onLeadingPress={back}
      counter={stepCounter("permissions", state.plan)}
      footer={
        <Button
          size="lg"
          disabled={!permissions}
          // The "SMS allowed" screen is only for when it is.
          onPress={() => router.push(smsAllowed ? "/sms-ok" : "/accounts")}
        >
          <Text>Next</Text>
        </Button>
      }
    >
      <StepIntro title="Can Penny see your alerts?">
        Two switches in Android settings. Penny can only read, never send or pay.
      </StepIntro>

      {permissions ? (
        <View className="px-gutter pt-6">
          <StatusRow
            title="Notification access"
            subtitle={permissions.notifications === "allowed" ? "Allowed" : "Not allowed yet"}
            done={permissions.notifications === "allowed"}
            action={{
              label: "Allow",
              disabled: busy,
              onPress: ask(device.requestNotificationAccess),
            }}
          />

          {smsAllowed ? (
            <StatusRow title="Bank SMS" subtitle="Allowed" done />
          ) : (
            <View className="gap-3.5 pb-5 pt-[18px]">
              <View className="gap-0.5">
                <Text className="font-sans-bold text-body-lg">Bank SMS</Text>
                <Text variant="caption">
                  Android locks this for apps installed outside the Play Store. Unlock it once:
                </Text>
              </View>
              <View className="flex-row gap-3">
                <UnlockStep number={1} sketch={<AppInfoMenuSketch />}>
                  App info, tap the menu
                </UnlockStep>
                <UnlockStep number={2} sketch={<RestrictedSettingsSketch />}>
                  Allow restricted settings
                </UnlockStep>
                <UnlockStep number={3} sketch={<AllowSmsSketch />}>
                  Back here, allow SMS
                </UnlockStep>
              </View>
              {permissions.sms === "restricted" ? (
                <Button variant="outline" disabled={busy} onPress={ask(device.openAppInfo)}>
                  <Text>Open App info</Text>
                </Button>
              ) : (
                <Button variant="outline" disabled={busy} onPress={ask(device.requestSmsAccess)}>
                  <Text>Allow SMS</Text>
                </Button>
              )}
            </View>
          )}

          <StatusRow
            divider
            title="Battery: Unrestricted"
            subtitle={
              permissions.battery === "unrestricted"
                ? "Allowed"
                : "So Android doesn't put Penny to sleep"
            }
            done={permissions.battery === "unrestricted"}
            action={{
              label: "Fix",
              disabled: busy,
              onPress: ask(device.requestUnrestrictedBattery),
            }}
          />
        </View>
      ) : null}
    </OnboardingScreen>
  );
}
