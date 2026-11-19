import { Link } from "expo-router";
import { useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text } from "@repo/design-system";
import { authClient } from "@/lib/auth-client";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { data: session } = authClient.useSession();
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
        {__DEV__ ? (
          <Link href="/design-system" asChild>
            <Button variant="link" size="sm" className="self-center">
              <Text>Open the design system gallery</Text>
            </Button>
          </Link>
        ) : null}
        <Button variant="outline" size="lg" disabled={signingOut} onPress={signOut}>
          <Text>Sign out</Text>
        </Button>
      </View>
    </View>
  );
}
