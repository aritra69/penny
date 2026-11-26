import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useState } from "react";
import { ActivityIndicator } from "react-native";

import { Button, colors, Icon, Text } from "@repo/design-system";
import { authClient } from "@/lib/auth/client";

/** The API's Google client ID ("Web application"). ID tokens are issued for it, so the API accepts them. */
const WEB_CLIENT_ID = process.env.RN_PUBLIC_GOOGLE_WEB_CLIENT_ID;

if (WEB_CLIENT_ID) GoogleSignin.configure({ webClientId: WEB_CLIENT_ID });

type GoogleButtonProps = {
  disabled?: boolean;
  onError: (message: string | null) => void;
};

/**
 * Signs in with the phone's Google account through the native Google SDK, then hands the ID token
 * to the API, which verifies it and starts a session. The root navigator then swaps to setup or Home.
 */
export function GoogleButton({ disabled, onError }: GoogleButtonProps) {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    onError(null);
    if (!WEB_CLIENT_ID) {
      onError("Google sign-in isn't set up in this build yet.");
      return;
    }
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (isCancelledResponse(response)) return;
      const idToken = response.data.idToken;
      if (!idToken) {
        onError("Google didn't confirm your account. Try again.");
        return;
      }
      const { error } = await authClient.signIn.social({
        provider: "google",
        idToken: { token: idToken },
      });
      if (error?.code === "PROVIDER_NOT_FOUND") {
        onError("Google sign-in isn't set up on this server yet.");
      } else if (error) {
        onError(error.message ?? "Google sign-in failed. Try again.");
      }
    } catch (error) {
      if (isErrorWithCode(error) && error.code === statusCodes.IN_PROGRESS) return;
      if (isErrorWithCode(error) && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onError("Google sign-in needs Google Play services on this phone.");
      } else {
        onError("Couldn't reach Penny. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="lg" disabled={disabled || loading} onPress={signIn}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.ink} />
      ) : (
        <Icon name="google" size={20} />
      )}
      <Text>Continue with Google</Text>
    </Button>
  );
}
