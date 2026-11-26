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
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { useAppNavigation } from "@/src/navigation/types";
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
  const navigation = useAppNavigation();
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
      counter={stepCounter("permissions")}
      footer={
        <Button
          size="lg"
          disabled={!permissions}
          // The "SMS allowed" screen is only for when it is.
          onPress={() => navigation.push(smsAllowed ? "sms-ok" : "accounts")}
        >
          <Text>Next</Text>
        </Button>
      }
    >
      <StepIntro title="Can Penny see your alerts?">
        Read-only. Penny can never send or pay.
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

          {permissions.sms === "restricted" ? (
            // Sideloaded installs: Android locks SMS until "Allow restricted settings" is on.
            <View className="gap-3.5 pb-5 pt-[18px]">
              <View className="gap-0.5">
                <Text className="font-sans-bold text-body-lg">Bank SMS</Text>
                <Text variant="caption">Locked for apps from outside the Play Store:</Text>
              </View>
              <View className="flex-row gap-3">
                <UnlockStep number={1} sketch={<AppInfoMenuSketch />}>
                  Tap ⋮ in App info
                </UnlockStep>
                <UnlockStep number={2} sketch={<RestrictedSettingsSketch />}>
                  Allow restricted settings
                </UnlockStep>
                <UnlockStep number={3} sketch={<AllowSmsSketch />}>
                  Allow SMS here
                </UnlockStep>
              </View>
              <Button variant="outline" disabled={busy} onPress={ask(device.openAppInfo)}>
                <Text>Open App info</Text>
              </Button>
            </View>
          ) : (
            <StatusRow
              divider
              title="Bank SMS"
              subtitle={smsAllowed ? "Allowed" : "Not allowed yet"}
              done={smsAllowed}
              action={{ label: "Allow", disabled: busy, onPress: ask(device.requestSmsAccess) }}
            />
          )}
          <StatusRow
            divider
            title="Battery: Unrestricted"
            subtitle={
              permissions.battery === "unrestricted" ? "Allowed" : "So Penny isn't put to sleep"
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
