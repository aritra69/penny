import "@repo/design-system/global.css";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { InterTight_700Bold, InterTight_800ExtraBold } from "@expo-google-fonts/inter-tight";
import { PortalHost } from "@rn-primitives/portal";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { authClient } from "@/lib/auth-client";
import { OnboardingProvider, useOnboarding } from "@/lib/onboarding/store";
import { Wordmark } from "@repo/design-system";

/** The splash stays up at least this long, so it reads as a screen and not a flicker. */
const SPLASH_MS = 900;

export default function RootLayout() {
  const { data: session, isPending } = authClient.useSession();
  // Family names here are the ones tailwind.config.js and lib/theme.ts refer to.
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    InterTight_700Bold,
    InterTight_800ExtraBold,
  });
  // A font error falls through to system fonts rather than blocking the app.
  const fontsReady = fontsLoaded || !!fontError;

  return (
    <OnboardingProvider userId={session?.user.id ?? null}>
      {/* The Expo plugin caches the session in SecureStore, so this is brief after the first sign-in. */}
      <RootNavigator loading={isPending || !fontsReady} signedIn={!!session} />
      <PortalHost />
    </OnboardingProvider>
  );
}

/**
 * Three places to be, and exactly one is open at a time:
 * signed out → Welcome · signed in, setup unfinished → setup, at the step left · otherwise → Home.
 */
function RootNavigator({ loading, signedIn }: { loading: boolean; signedIn: boolean }) {
  const { ready, state } = useOnboarding();
  const [splashHeld, setSplashHeld] = useState(true);

  // Timed from when the wordmark can be drawn, not from launch: fonts may take longer than the hold.
  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => setSplashHeld(false), SPLASH_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) return <Splash blank />;
  // `ready` is false while this account's saved setup progress is read from the phone.
  if (splashHeld || !ready) return <Splash />;

  const onboarded = state.completed;
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected
          guard={signedIn && onboarded}
          redirectTo={signedIn ? "/resume" : "/sign-in"}
        >
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={signedIn && !onboarded} redirectTo={signedIn ? "/" : "/sign-in"}>
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn} redirectTo={onboarded ? "/" : "/resume"}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

/** Paper with the wordmark. `blank` while the fonts that draw it are still loading. */
function Splash({ blank }: { blank?: boolean }) {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      {blank ? null : <Wordmark />}
      <StatusBar style="dark" />
    </View>
  );
}
