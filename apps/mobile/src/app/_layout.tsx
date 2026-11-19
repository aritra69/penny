import "../../global.css";

import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import { authClient } from "@/lib/auth-client";

export default function RootLayout() {
  const { data: session, isPending } = authClient.useSession();

  // The Expo plugin caches the session in SecureStore, so this is brief after the first sign-in.
  if (isPending) {
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
