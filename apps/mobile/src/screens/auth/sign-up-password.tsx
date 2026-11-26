import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthStep } from "@/components/auth/auth-step";
import { authClient } from "@/lib/auth/client";
import { checkNewPassword, MIN_PASSWORD_LENGTH } from "@/lib/auth-validation";
import type { RootStackParamList } from "@/src/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "sign-up-password">;

export default function SignUpPasswordScreen({ route }: Props) {
  const { name, email } = route.params;

  async function createAccount(password: string) {
    try {
      const { error } = await authClient.signUp.email({ name, email, password });
      // On success the root navigator sees the new session and moves on to setup.
      return error ? (error.message ?? "Couldn't create your account. Try again.") : null;
    } catch {
      return "Couldn't reach Penny. Check your connection and try again.";
    }
  }

  return (
    <AuthStep
      step={3}
      steps={3}
      title="Create a password"
      line={`At least ${MIN_PASSWORD_LENGTH} characters.`}
      field={{
        label: "Password",
        secureTextEntry: true,
        autoCapitalize: "none",
        autoCorrect: false,
        autoComplete: "new-password",
        textContentType: "newPassword",
      }}
      action="Create account"
      check={checkNewPassword}
      onDone={createAccount}
    />
  );
}
