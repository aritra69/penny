import { View } from "react-native";

import { OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { useOnboardingStep } from "@/lib/onboarding/use-step";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, colors, Icon, Text } from "@repo/design-system";

export default function SmsAllowedScreen() {
  useOnboardingStep("sms-ok");
  const navigation = useAppNavigation();

  return (
    <OnboardingScreen
      tone="dark"
      footer={
        // Replaced, not pushed: back from "Your accounts" goes to the permissions step.
        <Button
          variant="ghost"
          className="self-center"
          onPress={() => navigation.replace("accounts")}
        >
          <Text className="text-body-lg text-primary-foreground">Close</Text>
        </Button>
      }
    >
      <View className="pl-4 pt-28">
        <Icon name="check" size={72} color={colors.paper} strokeWidth={2.5} />
      </View>
      <View className="gap-2.5 px-gutter pt-7">
        <Text
          role="heading"
          aria-level={1}
          className="font-display text-[26px] leading-8 text-primary-foreground"
        >
          Penny can now read your bank SMS
        </Text>
        <Text className="text-primary-foreground">
          Only bank senders. One-time codes are dropped on the phone.
        </Text>
      </View>
    </OnboardingScreen>
  );
}
