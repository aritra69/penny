import { useState } from "react";
import { View } from "react-native";

import { GoogleButton } from "@/components/auth/google-button";
import { IllustrationSlot, OnboardingScreen } from "@/components/onboarding/onboarding-screen";
import { useAppNavigation } from "@/src/navigation/types";
import { Button, Text } from "@repo/design-system";

/** The picture above the headline, one per mode. Swap a file here to change it. */
const HERO = {
  "sign-in": require("@/assets/illustrations/hero-login.png"),
  "sign-up": require("@/assets/illustrations/hero-signup.png"),
};
/** The design's height. On a shorter screen the picture gets only the room the rest leaves. */
const HERO_HEIGHT = 240;
/** Below this the picture would be a sliver, so it's left out. */
const HERO_MIN_HEIGHT = 96;

type WelcomeScreenProps = {
  /**
   * "sign-in": Google, or email (log-in-email, then log-in-password).
   * "sign-up": Google, or email (sign-up-name, sign-up-email, sign-up-password).
   */
  mode: "sign-in" | "sign-up";
};

/**
 * Welcome: the first screen after the splash. A picture, one line and one way in: Google here, or
 * email, which goes on to one screen per field so nothing has to scroll.
 */
export function WelcomeScreen({ mode }: WelcomeScreenProps) {
  const signUp = mode === "sign-up";
  const navigation = useAppNavigation();
  const [error, setError] = useState<string | null>(null);
  // The room above the headline once the rest is laid out; the picture fits itself into it.
  const [heroSpace, setHeroSpace] = useState(0);
  const heroHeight = Math.min(HERO_HEIGHT, heroSpace);

  return (
    <OnboardingScreen
      footer={
        <>
          {error ? (
            <Text role="alert" variant="caption" className="pb-2 text-destructive">
              {error}
            </Text>
          ) : null}
          <Button
            size="lg"
            onPress={() => navigation.push(signUp ? "sign-up-name" : "log-in-email")}
          >
            <Text>{signUp ? "Sign up with email" : "Log in with email"}</Text>
          </Button>
          <Button
            variant="link"
            size="sm"
            className="self-center"
            onPress={() => navigation.replace(signUp ? "sign-in" : "sign-up")}
          >
            <Text className="text-caption">
              {signUp ? "Have an account? Log in" : "New here? Create account"}
            </Text>
          </Button>
        </>
      }
    >
      {/* Takes whatever height the rest doesn't need, so the whole screen fits without scrolling;
          the picture sits in the middle of it when there is room to spare. */}
      <View
        className="flex-1 justify-center pt-4"
        onLayout={(event) => setHeroSpace(Math.round(event.nativeEvent.layout.height) - 16)}
      >
        {heroHeight >= HERO_MIN_HEIGHT ? (
          <IllustrationSlot source={HERO[mode]} height={heroHeight} />
        ) : null}
      </View>
      <Text variant="title" className="px-gutter pt-5">
        Know where your money goes.
      </Text>
      <View className="px-gutter pt-5">
        <GoogleButton onError={setError} />
      </View>
    </OnboardingScreen>
  );
}
