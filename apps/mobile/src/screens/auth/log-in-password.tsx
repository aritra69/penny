import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";

import { AuthStep } from "@/components/auth/auth-step";
import { authClient } from "@/lib/auth/client";
import { checkPassword } from "@/lib/auth-validation";
import type { RootStackParamList } from "@/src/navigation/types";
import { Button, Text } from "@repo/design-system";

type Props = NativeStackScreenProps<RootStackParamList, "log-in-password">;

export default function LogInPasswordScreen({ route }: Props) {
  const { email } = route.params;
  const [notice, setNotice] = useState<string | null>(null);

  async function logIn(password: string) {
    try {
      const { error } = await authClient.signIn.email({ email, password });
      // On success the root navigator sees the new session and moves on to setup or Home.
      return error ? (error.message ?? "Couldn't log in. Try again.") : null;
    } catch {
      return "Couldn't reach Penny. Check your connection and try again.";
    }
  }

  return (
    <AuthStep
      step={2}
      steps={2}
      title="Enter your password"
      line={email}
      field={{
        label: "Password",
        secureTextEntry: true,
        autoCapitalize: "none",
        autoCorrect: false,
        autoComplete: "current-password",
        textContentType: "password",
      }}
      action="Log in"
      check={checkPassword}
      onDone={logIn}
    >
      <Button
        variant="link"
        size="sm"
        className="self-end px-0"
        onPress={() => setNotice("Password reset isn't available on this server yet.")}
      >
        <Text className="text-caption">Forgot password?</Text>
      </Button>
      {notice ? (
        <Text role="alert" variant="caption">
          {notice}
        </Text>
      ) : null}
    </AuthStep>
  );
}
