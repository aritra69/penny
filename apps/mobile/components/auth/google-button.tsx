import { useState } from "react";
import { ActivityIndicator } from "react-native";

import { Button, Text } from "@repo/design-system";
import { authClient } from "@/lib/auth-client";

type GoogleButtonProps = {
  disabled?: boolean;
  onError: (message: string | null) => void;
};

/**
 * Opens Google's consent page in an in-app browser. Better Auth's Expo plugin catches the
 * redirect back to penny://, stores the session, and the root layout swaps to the signed-in stack.
 */
export function GoogleButton({ disabled, onError }: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    onError(null);
    setLoading(true);
    try {
      const { error } = await authClient.signIn.social({ provider: "google", callbackURL: "/" });
      if (error?.code === "PROVIDER_NOT_FOUND") {
        onError("Google sign-in isn't set up on this server yet.");
      } else if (error) {
        onError(error.message ?? "Google sign-in failed. Try again.");
      }
    } catch {
      onError("Couldn't reach Penny. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="lg" disabled={disabled || loading} onPress={signIn}>
      {loading ? <ActivityIndicator size="small" /> : null}
      <Text>Continue with Google</Text>
    </Button>
  );
}
