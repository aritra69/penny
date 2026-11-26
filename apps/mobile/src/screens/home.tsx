import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@repo/design-system";
import { authClient } from "@/lib/auth/client";
import { useOnboarding } from "@/lib/onboarding/store";
import { useAppNavigation } from "@/src/navigation/types";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const { data: session } = authClient.useSession();
  const { state, reset } = useOnboarding();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    // Clears the stored session; the root layout then shows sign-in.
    await authClient.signOut().finally(() => setSigningOut(false));
  }

  return (
    <View
      className="flex-1 justify-between bg-background px-6"
      style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
    >
      <View className="gap-2">
        <Text variant="h3">Hi, {session?.user.name.split(" ")[0] ?? "there"}</Text>
        <Text variant="muted">Signed in as {session?.user.email}</Text>
      </View>
      <View className="gap-3">
        {/* Until Home has its Settings, Your plan is reached from here. */}
        <Button variant="outline" size="lg" onPress={() => navigation.navigate("your-plan")}>
          <Text>Your plan</Text>
        </Button>
        {__DEV__ && state.plan === "subscription" && state.trialEndsAt ? (
          <Button
            variant="link"
            size="sm"
            className="self-center"
            onPress={() => navigation.navigate("trial-ending")}
          >
            <Text>Preview the free month ending</Text>
          </Button>
        ) : null}
        {__DEV__ ? (
          <Button
            variant="link"
            size="sm"
            className="self-center"
            onPress={() => navigation.navigate("design-system")}
          >
            <Text>Open the design system gallery</Text>
          </Button>
        ) : null}
        {__DEV__ ? (
          <Button variant="link" size="sm" className="self-center" onPress={reset}>
            <Text>Run setup again</Text>
          </Button>
        ) : null}
        <Button variant="outline" size="lg" disabled={signingOut} onPress={signOut}>
          <Text>Sign out</Text>
        </Button>
      </View>
    </View>
  );
}
