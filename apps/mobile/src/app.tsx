import { NavigationContainer } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { authClient } from "@/lib/auth/client";
import { OnboardingProvider, useOnboarding } from "@/lib/onboarding/store";
import { RootNavigator } from "@/src/navigation/root-navigator";
import { colors, Wordmark } from "@repo/design-system";

/** The splash stays up at least this long, so it reads as a screen and not a flicker. */
const SPLASH_MS = 900;

/** Paper behind every screen, so transitions never flash the default white or black. */
const NAVIGATION_THEME = {
  dark: false,
  colors: {
    primary: colors.ink,
    background: colors.paper,
    card: colors.paper,
    text: colors.ink,
    border: colors.ink,
    notification: colors.ink,
  },
  fonts: {
    regular: { fontFamily: "Inter_400Regular", fontWeight: "400" },
    medium: { fontFamily: "Inter_500Medium", fontWeight: "500" },
    bold: { fontFamily: "Inter_700Bold", fontWeight: "700" },
    heavy: { fontFamily: "InterTight_800ExtraBold", fontWeight: "800" },
  },
} as const;

export default function App() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <SafeAreaProvider>
      <OnboardingProvider userId={session?.user.id ?? null}>
        {/* The last session is cached in the Keychain, so this is brief after the first sign-in. */}
        <Root loading={isPending} signedIn={!!session} />
        <PortalHost />
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}

function Root({ loading, signedIn }: { loading: boolean; signedIn: boolean }) {
  const { ready } = useOnboarding();
  const [splashHeld, setSplashHeld] = useState(true);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => setSplashHeld(false), SPLASH_MS);
    return () => clearTimeout(timer);
  }, [loading]);

  // `ready` is false while this account's saved setup progress is read from the phone.
  if (loading || splashHeld || !ready) return <Splash />;

  return (
    <NavigationContainer theme={NAVIGATION_THEME}>
      <RootNavigator signedIn={signedIn} />
      <StatusBar barStyle="dark-content" />
    </NavigationContainer>
  );
}

/** Paper with the wordmark. Fonts ship with the app, so it can be drawn straight away. */
function Splash() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Wordmark />
      <StatusBar barStyle="dark-content" />
    </View>
  );
}
