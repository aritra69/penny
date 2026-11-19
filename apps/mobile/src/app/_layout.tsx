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
import { ActivityIndicator, View } from "react-native";

import { authClient } from "@/lib/auth-client";

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

  // The Expo plugin caches the session in SecureStore, so this is brief after the first sign-in.
  // A font error falls through to system fonts rather than blocking the app.
  if (isPending || (!fontsLoaded && !fontError)) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  const signedIn = !!session;
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={signedIn} redirectTo="/sign-in">
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn} redirectTo="/">
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>
      <StatusBar style="auto" />
      <PortalHost />
    </>
  );
}
